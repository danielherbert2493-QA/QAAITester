import { AppError } from './errors.js';

export function isValidIssueKey(value) {
  return typeof value === 'string' && /^[A-Z][A-Z0-9_]*-\d+$/i.test(value.trim());
}

export function jiraApiUrl(baseUrl, suffix) {
  let base;
  try {
    base = new URL(baseUrl);
  } catch {
    throw new AppError(503, 'Jira base URL is missing or invalid.');
  }
  if (!['http:', 'https:'].includes(base.protocol)) {
    throw new AppError(503, 'Jira base URL must use HTTP or HTTPS.');
  }
  const apiVersion = base.hostname.toLowerCase().endsWith('.atlassian.net') ? '3' : '2';
  base.pathname = `${base.pathname.replace(/\/+$/, '')}/rest/api/${apiVersion}/${suffix.replace(/^\/+/, '')}`;
  base.search = '';
  base.hash = '';
  return base;
}

export function extractJiraText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(extractJiraText).filter(Boolean).join('\n');
  if (!value || typeof value !== 'object') return '';
  if (typeof value.text === 'string') return value.text;
  const children = value.content ?? value.value ?? [];
  return extractJiraText(children);
}

function extractNamedField(fields, names, pattern) {
  const entry = Object.entries(names ?? {}).find(([fieldId, label]) => {
    return pattern.test(label) && fields[fieldId] !== null && fields[fieldId] !== undefined;
  });
  return entry ? extractJiraText(fields[entry[0]]) : '';
}

export function normalizeJiraIssue(issue, baseUrl) {
  const fields = issue.fields ?? {};
  const acceptanceCriteria = extractNamedField(
    fields,
    issue.names,
    /acceptance criteria|acceptance criterion/i,
  );
  const linkedIssues = (fields.issuelinks ?? []).flatMap((link) => {
    const linked = link.outwardIssue ?? link.inwardIssue;
    if (!linked?.key) return [];
    return [{
      key: linked.key,
      relationship: link.type?.name ?? '',
      summary: linked.fields?.summary ?? '',
    }];
  });
  const url = new URL(baseUrl);
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/browse/${encodeURIComponent(issue.key)}`;
  url.search = '';
  url.hash = '';
  return {
    key: issue.key,
    url: url.toString(),
    summary: fields.summary ?? 'Summary not provided',
    issueType: fields.issuetype?.name ?? '',
    status: fields.status?.name ?? '',
    priority: fields.priority?.name ?? '',
    labels: fields.labels ?? [],
    components: (fields.components ?? []).map((component) => component.name).filter(Boolean),
    description: extractJiraText(fields.description),
    acceptanceCriteria,
    linkedIssues,
    subtasks: (fields.subtasks ?? []).map((subtask) => ({
      key: subtask.key,
      summary: subtask.fields?.summary ?? '',
    })),
  };
}

function jiraError(status) {
  if (status === 401) return new AppError(502, 'Jira authentication failed. Check the email and API token in cred.env.');
  if (status === 403) return new AppError(403, 'The configured Jira account does not have permission to read this issue.');
  if (status === 404) return new AppError(404, 'Jira issue was not found or is not visible to the configured account.');
  if (status === 429) return new AppError(503, 'Jira is rate-limiting requests. Try again shortly.');
  return new AppError(502, status >= 500 ? 'Jira is temporarily unavailable.' : 'Jira rejected the issue request.');
}

function authHeaders(config) {
  return {
    Accept: 'application/json',
    Authorization: `Basic ${Buffer.from(`${config.email}:${config.token}`).toString('base64')}`,
  };
}

function assertJiraConfig(config) {
  if (!config.baseUrl || !config.email || !config.token) {
    throw new AppError(503, 'Jira is not fully configured. Check JIRA_BASE_URL, JIRA_EMAIL, and JIRA_TOKEN in cred.env.');
  }
}

export async function testJiraConnection(config, fetchImpl = fetch) {
  assertJiraConfig(config);
  const url = jiraApiUrl(config.baseUrl, 'myself');
  let response;
  try {
    response = await fetchImpl(url, {
      headers: authHeaders(config),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new AppError(502, 'Could not reach Jira. Check the base URL and network connection.');
  }
  if (!response.ok) throw jiraError(response.status);
}

export async function fetchJiraIssue(issueKey, config, fetchImpl = fetch) {
  const key = typeof issueKey === 'string' ? issueKey.trim().toUpperCase() : '';
  if (!isValidIssueKey(key)) throw new AppError(400, 'Enter a valid Jira issue key, such as QA-123.');
  assertJiraConfig(config);

  const url = jiraApiUrl(config.baseUrl, `issue/${encodeURIComponent(key)}`);
  url.searchParams.set('expand', 'names');
  url.searchParams.set('fields', '*all');
  let response;
  try {
    response = await fetchImpl(url, {
      headers: authHeaders(config),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new AppError(502, 'Could not reach Jira. Check the base URL and network connection.');
  }
  if (!response.ok) throw jiraError(response.status);

  let issue;
  try {
    issue = await response.json();
  } catch {
    throw new AppError(502, 'Jira returned an unreadable issue response.');
  }
  if (!issue?.key || !issue?.fields) throw new AppError(502, 'Jira returned incomplete issue data.');
  return normalizeJiraIssue(issue, config.baseUrl);
}

