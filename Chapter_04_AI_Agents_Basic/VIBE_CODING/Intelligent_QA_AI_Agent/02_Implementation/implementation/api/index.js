// Vercel serverless entry point. vercel.json rewrites every /api/* request here.
// Credentials come from Vercel Project Environment Variables (no cred.env on Vercel).
import { app, errorHandler } from '../src/backend/app.js';

app.use(errorHandler);

export default app;
