import express from 'express';
import { credentialsPath, getGroqConfig, getJiraConfig, getPublicSettings } from './config.js';
import { AppError } from './errors.js';
import { fetchJiraIssue, isValidIssueKey, testJiraConnection } from './jira.js';
import { listModels, testModel, validateModelSelection } from './llm.js';
import { generateArtifact, sourceWasTruncated } from './planner.js';
import { getTemplateStatus, loadArtifactTemplate } from './templates.js';

// API-only Express app. Used by the local server (server.js) and by the
// Vercel serverless function (api/index.js).
export const app = express();

function providerConfig() {
  return { groqApiKey: getGroqConfig().apiKey };
}

function requireProvider(value) {
  if (!['groq', 'ollama'].includes(value)) {
    throw new AppError(400, 'Choose Groq or Ollama as the LLM provider.');
  }
  return value;
}

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/settings', (_request, response) => {
  response.json({
    ...getPublicSettings(),
    credentialsFileFound: Boolean(credentialsPath),
    hosted: Boolean(process.env.VERCEL),
  });
});

app.get('/api/templates/status', async (_request, response) => {
  response.json({ templates: await getTemplateStatus() });
});

app.post('/api/jira/test', async (_request, response) => {
  await testJiraConnection(getJiraConfig());
  response.json({ message: 'Jira connection successful. The account is ready to read issues.' });
});

app.get('/api/llm/models', async (request, response) => {
  const provider = requireProvider(request.query.provider);
  const models = await listModels(provider, providerConfig());
  response.json({ models });
});

app.post('/api/llm/test', async (request, response) => {
  const provider = requireProvider(request.body?.provider);
  await testModel(provider, request.body?.model, providerConfig());
  response.json({ message: `${provider === 'groq' ? 'Groq' : 'Ollama'} model connection successful.` });
});

app.post('/api/artifact', async (request, response) => {
  const issueKey = typeof request.body?.issueKey === 'string' ? request.body.issueKey.trim().toUpperCase() : '';
  if (!isValidIssueKey(issueKey)) throw new AppError(400, 'Enter a valid Jira issue key, such as QA-123.');
  const template = await loadArtifactTemplate(request.body?.artifactId);
  if (!template.available) {
    throw new AppError(409, `Cannot generate this artifact: ${template.file} is unavailable.`);
  }
  const provider = requireProvider(request.body?.provider);
  const model = request.body?.model;
  validateModelSelection(provider, model, providerConfig());
  const issue = await fetchJiraIssue(issueKey, getJiraConfig());
  const sourceTruncated = sourceWasTruncated(issue);
  const content = await generateArtifact(
    template.id,
    issue,
    template.content,
    provider,
    model,
    providerConfig(),
  );
  response.json({
    issue,
    artifactId: template.id,
    artifact: { status: 'complete', content },
    sourceNotice: sourceTruncated
      ? 'Some Jira text exceeded the prompt limit and was excerpted. Review the output against the full Jira issue for completeness.'
      : null,
  });
});

app.use('/api', (_request, _response, next) => {
  next(new AppError(404, 'API endpoint not found.'));
});

export function errorHandler(error, request, response, _next) {
  const status = error instanceof AppError ? error.status : 500;
  const message = error instanceof AppError ? error.message : 'Unexpected server error.';
  if (status >= 500) console.error(`${request.method} ${request.path} failed (${error.name || 'Error'}).`);
  response.status(status).json({ error: message });
}

export default app;
