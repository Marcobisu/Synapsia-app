import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse-fork');
console.log('pdfParse:', typeof pdfParse, pdfParse);
