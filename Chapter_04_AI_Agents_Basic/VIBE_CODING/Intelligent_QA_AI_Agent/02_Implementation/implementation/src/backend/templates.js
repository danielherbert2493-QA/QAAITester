import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppError } from './errors.js';

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
// 01_Plan/ is the source of truth. implementation/templates/ is a synced copy
// (npm run sync-templates) bundled with the Vercel function, where 01_Plan/ is
// outside the deployed app. Prefer 01_Plan/ when it exists.
const templateDirectories = [
  path.resolve(backendDirectory, '../../../../01_Plan'),
  path.resolve(backendDirectory, '../../templates'),
];

async function readTemplateFile(file) {
  for (const directory of templateDirectories) {
    try {
      return await fs.readFile(path.join(directory, file), 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const notFound = new Error('Template not found.');
  notFound.code = 'ENOENT';
  throw notFound;
}

export const artifactDefinitions = [
  { id: 'testPlan', title: 'Test Plan', file: '00_Test_Plan_Template.md' },
  { id: 'testStrategy', title: 'Test Strategy', file: '01_Test_Strategy_Template.md' },
  { id: 'testCases', title: 'Test Case Creation', file: '02_Test_Case_Creation_Template.md' },
];

async function loadTemplate(definition) {
  try {
    const content = await readTemplateFile(definition.file);
    if (!content.trim()) {
      return { ...definition, available: false, error: 'Template is empty.' };
    }
    return { ...definition, available: true, content };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { ...definition, available: false, error: 'Template file was not found.' };
    }
    throw new AppError(500, `Could not read the ${definition.title} template.`);
  }
}

export async function loadArtifactTemplates() {
  return Promise.all(artifactDefinitions.map(loadTemplate));
}

export async function loadArtifactTemplate(artifactId) {
  const definition = artifactDefinitions.find((artifact) => artifact.id === artifactId);
  if (!definition) {
    throw new AppError(400, 'Choose Test Plan, Test Strategy, or Test Case Creation.');
  }
  return loadTemplate(definition);
}

export async function getTemplateStatus() {
  const templates = await loadArtifactTemplates();
  return templates.map(({ id, title, file, available, error }) => ({
    id,
    title,
    file,
    available,
    ...(error ? { error } : {}),
  }));
}

