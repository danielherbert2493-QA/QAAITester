import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { app, errorHandler } from './app.js';

// Local server: API + frontend (built dist/ or Vite dev middleware).
const directory = path.dirname(fileURLToPath(import.meta.url));
const appDirectory = path.resolve(directory, '../..');
const distDirectory = path.join(appDirectory, 'dist');

if (fs.existsSync(path.join(distDirectory, 'index.html'))) {
  app.use(express.static(distDirectory));
  app.get(/.*/, (_request, response) => response.sendFile(path.join(distDirectory, 'index.html')));
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    configFile: path.join(appDirectory, 'vite.config.js'),
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.use(errorHandler);

const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number.');
}
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`QA Studio running at http://127.0.0.1:${port}`);
});
server.on('error', (error) => {
  console.error(`Could not start the local server: ${error.message}`);
  process.exitCode = 1;
});
