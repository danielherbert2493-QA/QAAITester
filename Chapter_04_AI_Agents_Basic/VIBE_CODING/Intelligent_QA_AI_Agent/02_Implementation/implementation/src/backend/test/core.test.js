import test from 'node:test';
import assert from 'node:assert/strict';
import { extractJiraText, fetchJiraIssue, isValidIssueKey, normalizeJiraIssue, testJiraConnection } from '../jira.js';
import { completeChat, listModels, validateModelSelection } from '../llm.js';
import { buildArtifactMessages, generateArtifact, pruneUnsupportedDetails, removeDuplicateSections, sourceWasTruncated, validateArtifactStructure } from '../planner.js';
import { AppError } from '../errors.js';
import { artifactDefinitions, getTemplateStatus, loadArtifactTemplate, loadArtifactTemplates } from '../templates.js';

const issue = {
  key: 'QA-12',
  url: 'https://example.atlassian.net/browse/QA-12',
  summary: 'Login flow',
  issueType: 'Story',
  status: 'Open',
  priority: '',
  description: 'Users can sign in.',
  acceptanceCriteria: 'Valid credentials open the account.',
  labels: [],
  components: [],
  linkedIssues: [{ key: 'QA-13', relationship: 'blocks', summary: 'Account service' }],
  subtasks: [{ key: 'QA-14', summary: 'Add login UI' }],
};

test('validates Jira issue keys and extracts Atlassian document text', () => {
  assert.equal(isValidIssueKey('QA-123'), true);
  assert.equal(isValidIssueKey('not a ticket'), false);
  assert.equal(extractJiraText({ content: [{ content: [{ text: 'First' }] }, { text: 'Second' }] }), 'First\nSecond');
});

test('normalizes issue references, acceptance criteria, links, and subtasks', () => {
  const normalized = normalizeJiraIssue({
    key: 'QA-12',
    names: { customfield_10100: 'Acceptance Criteria' },
    fields: {
      summary: 'Login flow',
      description: { content: [{ content: [{ text: 'User can sign in.' }] }] },
      customfield_10100: 'Valid credentials are accepted.',
      issuelinks: [{ type: { name: 'Blocks' }, outwardIssue: { key: 'QA-13', fields: { summary: 'Account service' } } }],
      subtasks: [{ key: 'QA-14', fields: { summary: 'Add login UI' } }],
    },
  }, 'https://example.atlassian.net');
  assert.equal(normalized.url, 'https://example.atlassian.net/browse/QA-12');
  assert.equal(normalized.description, 'User can sign in.');
  assert.equal(normalized.acceptanceCriteria, 'Valid credentials are accepted.');
  assert.equal(normalized.linkedIssues[0].key, 'QA-13');
  assert.equal(normalized.subtasks[0].key, 'QA-14');
});

test('rejects invalid Jira keys before making a request', async () => {
  await assert.rejects(
    fetchJiraIssue('bad', { baseUrl: 'https://example.atlassian.net', email: 'qa@example.test', token: 'test-secret' }, () => {
      assert.fail('fetch should not be called for invalid issue keys');
    }),
    (error) => error instanceof AppError && error.status === 400,
  );
});

test('tests Jira connection using the configured REST endpoint', async () => {
  let requestedUrl;
  await testJiraConnection(
    { baseUrl: 'https://example.atlassian.net', email: 'qa@example.test', token: 'test-secret' },
    async (url) => {
      requestedUrl = url.toString();
      return { ok: true, status: 200 };
    },
  );
  assert.equal(requestedUrl, 'https://example.atlassian.net/rest/api/3/myself');
});

test('loads all three exact supplied templates and reports availability without content', async () => {
  const templates = await loadArtifactTemplates();
  const statuses = await getTemplateStatus();
  assert.equal(templates.length, 3);
  assert.deepEqual(templates.map((template) => template.file), artifactDefinitions.map((definition) => definition.file));
  assert.ok(templates.every((template) => template.available && template.content.trim()));
  assert.ok(statuses.every((status) => status.available && !Object.hasOwn(status, 'content')));
});

test('loads only the requested artifact template and rejects an invalid action', async () => {
  const template = await loadArtifactTemplate('testStrategy');
  assert.equal(template.id, 'testStrategy');
  assert.equal(template.available, true);
  assert.match(template.content, /1\. Overview/i);
  await assert.rejects(
    loadArtifactTemplate('all'),
    (error) => error instanceof AppError && error.status === 400,
  );
});

test('lists Groq models without returning credentials', async () => {
  let authorization;
  const models = await listModels('groq', { groqApiKey: 'test-secret' }, async (_url, options) => {
    authorization = options.headers.Authorization;
    return { ok: true, json: async () => ({ data: [{ id: 'z-model' }, { id: 'a-model' }] }) };
  });
  assert.equal(authorization, 'Bearer test-secret');
  assert.deepEqual(models, ['a-model', 'z-model']);
});

test('requires a selected model and configured provider before Jira retrieval', () => {
  assert.throws(
    () => validateModelSelection('groq', '', { groqApiKey: 'test-secret' }),
    (error) => error instanceof AppError && error.status === 400,
  );
  assert.throws(
    () => validateModelSelection('groq', 'a-model', {}),
    (error) => error instanceof AppError && error.status === 503,
  );
});

test('reports Groq rate limits once with a retry hint and no provider body details', async () => {
  await assert.rejects(
    completeChat('groq', 'test-model', [{ role: 'user', content: 'hello' }], { groqApiKey: 'test-secret' }, async () => ({
      status: 429,
      ok: false,
      headers: { get: (name) => name === 'retry-after' ? '2' : null },
      json: async () => ({ error: { message: 'internal rate limit detail' } }),
    })),
    (error) => error instanceof AppError
      && error.status === 429
      && /retry in about 2 seconds/i.test(error.message)
      && !error.message.includes('internal rate limit detail'),
  );
});

test('distinguishes a retryable Groq token limit from exhausted account quota', async () => {
  const rateLimitFetch = async () => ({
    status: 429,
    ok: false,
    headers: { get: () => null },
    json: async () => ({
      error: {
        type: 'tokens',
        code: 'rate_limit_exceeded',
        message: 'Rate limit reached for tokens per minute. Please try again in 1.4s.',
      },
    }),
  });
  await assert.rejects(
    completeChat('groq', 'test-model', [{ role: 'user', content: 'hello' }], { groqApiKey: 'test-secret' }, rateLimitFetch),
    (error) => error.status === 429 && /rate limit reached.*2 seconds/i.test(error.message) && !/quota is exhausted/i.test(error.message),
  );

  await assert.rejects(
    completeChat('groq', 'test-model', [{ role: 'user', content: 'hello' }], { groqApiKey: 'test-secret' }, async () => ({
      status: 429,
      ok: false,
      headers: { get: () => null },
      json: async () => ({
        error: {
          type: 'insufficient_quota',
          code: 'insufficient_quota',
          message: 'You exceeded your current quota.',
        },
      }),
    })),
    (error) => error.status === 429 && /quota is exhausted/i.test(error.message),
  );
});

test('reports oversized Groq requests with actionable guidance and does not retry', async () => {
  let requestCount = 0;
  await assert.rejects(
    completeChat('groq', 'test-model', [{ role: 'user', content: 'hello' }], { groqApiKey: 'test-secret' }, async () => {
      requestCount += 1;
      return { status: 413, ok: false };
    }),
    (error) => error instanceof AppError
      && error.status === 413
      && /too large for the selected model/i.test(error.message)
      && /smaller Jira issue|larger context window/i.test(error.message),
  );
  assert.equal(requestCount, 1);
});

test('bounds oversized Jira source text and signals that an excerpt was used', () => {
  const largeIssue = {
    ...issue,
    description: 'description '.repeat(4000),
    acceptanceCriteria: 'criteria '.repeat(2000),
  };
  const messages = buildArtifactMessages('testPlan', largeIssue, 'Template');
  assert.equal(sourceWasTruncated(largeIssue), true);
  assert.match(messages[0].content, /Jira source fields were excerpted/i);
  assert.match(messages[1].content, /"sourceTruncated": true/);
  assert.ok(messages[1].content.length < 40000);
});

test('treats Jira text as data and rejects output missing a template section', () => {
  const template = artifactDefinitions.find((definition) => definition.id === 'testPlan');
  return loadArtifactTemplates().then((templates) => {
    const source = templates.find((item) => item.id === template.id).content;
    const messages = buildArtifactMessages(template.id, issue, source);
    assert.match(messages[0].content, /untrusted data/);
    assert.match(messages[0].content, /Exclude unsupported template fields/i);
    assert.throws(
      () => validateArtifactStructure(source.replace('12. Traceability and Glossary', ''), source),
      /omitted template sections/,
    );
    assert.doesNotThrow(() => validateArtifactStructure(source, source));
  });
});

test('accepts Markdown heading markers while preserving template heading order', () => {
  const template = '1. Overview\n1.1 Scope\n2. Strategy';
  assert.doesNotThrow(() => validateArtifactStructure('## Overview\n### Scope\n# Strategy', template));
  assert.throws(() => validateArtifactStructure('## Strategy\n## Overview\n### Scope', template), /omitted template sections/);
});

test('does not restore template sections omitted by the model', async () => {
  const template = (await loadArtifactTemplates()).find((item) => item.id === 'testPlan');
  const partialResponse = template.content.slice(0, template.content.indexOf('11. Entry/Exit/Suspension Criteria')).trim();
  let requestCount = 0;
  const output = await generateArtifact(
    'testPlan',
    issue,
    template.content,
    'groq',
    'test-model',
    { groqApiKey: 'test-secret' },
    async () => {
      requestCount += 1;
      return { ok: true, json: async () => ({ choices: [{ message: { content: partialResponse } }] }) };
    },
  );
  assert.equal(requestCount, 1);
  assert.doesNotMatch(output, /11\. Entry\/Exit\/Suspension Criteria/);
  assert.doesNotMatch(output, /12\. Traceability and Glossary/);
  assert.doesNotMatch(output, /Insufficient information to determine/);
  assert.doesNotThrow(() => validateArtifactStructure(output, template.content, { requireAll: false }));
});

test('keeps only generated template sections with one model request', async () => {
  const template = (await loadArtifactTemplates()).find((item) => item.id === 'testPlan');
  const omittedSections = new Set([
    '7. Non-Functional Test Plan',
    '9. Schedule, Effort and Deliverables',
    '10. Security and Compliance Test Plan',
    '11. Entry/Exit/Suspension Criteria, Risks and Sign-off',
    '12. Traceability and Glossary',
  ]);
  let currentSection = '';
  const partialResponse = template.content.split(/\r?\n/).filter((line) => {
    if (/^\d+\.\s+/.test(line.trim())) currentSection = line.trim();
    return !omittedSections.has(currentSection);
  }).join('\n');

  let requestCount = 0;
  const output = await generateArtifact(
    'testPlan',
    issue,
    template.content,
    'groq',
    'test-model',
    { groqApiKey: 'test-secret' },
    async () => {
      requestCount += 1;
      return { ok: true, json: async () => ({ choices: [{ message: { content: partialResponse } }] }) };
    },
  );

  assert.equal(requestCount, 1);
  for (const section of omittedSections) {
    assert.doesNotMatch(output, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(output, /Insufficient information to determine/);
  assert.doesNotThrow(() => validateArtifactStructure(output, template.content, { requireAll: false }));
});

test('removes repeated sections and unsupported-detail placeholders from generated output', () => {
  const duplicated = [
    '# 7. Non-Functional Test Plan',
    '| Test | Planned date |',
    '|------|--------------|',
    '| Performance | Insufficient information to determine. |',
    '',
    '# 7. Non-Functional Test Plan',
    '| Test | Planned date |',
  ].join('\n');
  const deduplicated = removeDuplicateSections(duplicated);
  const pruned = pruneUnsupportedDetails(deduplicated);
  assert.doesNotMatch(pruned, /Insufficient information to determine/);
  assert.doesNotMatch(pruned, /7\. Non-Functional Test Plan/);
});

for (const definition of artifactDefinitions) {
  test(`generates ${definition.title} from its supplied template using a mock provider`, async () => {
    const templates = await loadArtifactTemplates();
    const template = templates.find((item) => item.id === definition.id);
    let requestBody;
    const output = await generateArtifact(
      definition.id,
      issue,
      template.content,
      'groq',
      'test-model',
      { groqApiKey: 'test-secret' },
      async (_url, options) => {
        requestBody = JSON.parse(options.body);
        return { ok: true, json: async () => ({ choices: [{ message: { content: template.content } }] }) };
      },
    );
    assert.doesNotMatch(output, /Insufficient information to determine|\[[^\]]+\]/);
    assert.match(requestBody.messages[1].content, /acceptanceCriteria|acceptance criteria/i);
  });
}
