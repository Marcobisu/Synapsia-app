import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { initDb } from './database/db.js';
import { initAI } from './ai.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini
const apiKey = (process.env.GEMINI_API_KEY || '').trim();
if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('\n⚠️  ATTENZIONE: GEMINI_API_KEY non configurata nel file .env');
    console.warn('   Le risposte AI saranno simulate.\n');
}
initAI(apiKey);

// Initialize Database on startup
await initDb();

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api', projectRoutes);
app.use('/api', sessionRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Errore interno del server'
    });
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n🧠 Synapsia Backend running on http://localhost:${PORT}`);
        console.log(`   API endpoints:`);
        console.log(`   POST /api/auth/register - User registration`);
        console.log(`   POST /api/auth/login    - User login`);
        console.log(`   GET  /api/auth/me       - Get authenticated user`);
        console.log(`   POST /api/analyze       - Upload & analyze PDF (JWT Req)`);
        console.log(`   POST /api/analyze-text  - Analyze plain text (JWT Req)`);
        console.log(`   POST /api/question      - Get next question (JWT Req)`);
        console.log(`   POST /api/evaluate      - Evaluate answer (JWT Req)\n`);
    });
}

export default app;
