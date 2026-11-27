// Copies the authoritative templates from ../../01_Plan into ./templates so they
// are bundled with the Vercel function. Skips silently if 01_Plan is not present
// (the committed copies in ./templates are then used as-is).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(appDirectory, '../../01_Plan');
const target = path.join(appDirectory, 'templates');
const files = ['00_Test_Plan_Template.md', '01_Test_Strategy_Template.md', '02_Test_Case_Creation_Template.md'];

if (!fs.existsSync(source)) {
  console.log('01_Plan not found; using committed templates/.');
} else {
  fs.mkdirSync(target, { recursive: true });
  for (const file of files) {
    const from = path.join(source, file);
    if (fs.existsSync(from)) fs.copyFileSync(from, path.join(target, file));
  }
  console.log('Templates synced from 01_Plan.');
}
