// Polyfill for Vercel Serverless environment where DOMMatrix is missing
globalThis.DOMMatrix = globalThis.DOMMatrix || class DOMMatrix {};

import app from '../server/index.js';
export default app;
