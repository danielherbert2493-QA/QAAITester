import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

function loadParentCredentials() {
  let directory = path.dirname(fileURLToPath(import.meta.url));
  while (true) {
    const candidate = path.join(directory, 'cred.env');
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      return candidate;
    }
    const parent = path.dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}

export const credentialsPath = loadParentCredentials();

export function getJiraConfig() {
  return {
    baseUrl: process.env.JIRA_BASE_URL?.trim(),
    email: process.env.JIRA_EMAIL?.trim(),
    token: process.env.JIRA_TOKEN,
  };
}

export function getGroqConfig() {
  return { apiKey: process.env.GROQ_API_KEY };
}

export function getPublicSettings() {
  const jira = getJiraConfig();
  return {
    jira: {
      baseUrlConfigured: Boolean(jira.baseUrl),
      emailConfigured: Boolean(jira.email),
      tokenConfigured: Boolean(jira.token),
      configured: Boolean(jira.baseUrl && jira.email && jira.token),
    },
    llm: {
      groqConfigured: Boolean(getGroqConfig().apiKey),
    },
  };
}

