import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runQuery, getRow } from '../database/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'synapsia-super-secret-key-12345';

/**
 * POST /api/auth/register - User registration
 */
router.post('/register', validateRegister, async (req, res) => {
    try {
        const { name, email, password, mascotColor } = req.body;

        // Check if email already exists
        const existingUser = await getRow('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'Indirizzo email già registrato.' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = Date.now().toString() + Math.random().toString(36).substring(2, 7);

        // Insert user
        await runQuery(
            'INSERT INTO users (id, name, email, password_hash, mascot_color) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, passwordHash, mascotColor || '#48cae4']
        );

        // Generate JWT
        const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: { id: userId, name, email, mascotColor: mascotColor || '#48cae4', badgesUnlocked: [] }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Errore interno durante la registrazione.' });
    }
});

/**
 * POST /api/auth/login - User login
 */
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await getRow('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(400).json({ error: 'Credenziali non valide.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenziali non valide.' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mascotColor: user.mascot_color,
                badgesUnlocked: JSON.parse(user.badges_unlocked || '[]')
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Errore interno durante il login.' });
    }
});

/**
 * GET /api/auth/me - Get authenticated user profile
 */
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await getRow('SELECT id, name, email, mascot_color, badges_unlocked FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            mascotColor: user.mascot_color,
            badgesUnlocked: JSON.parse(user.badges_unlocked || '[]')
        });
    } catch (err) {
        console.error('Auth Me error:', err);
        res.status(500).json({ error: 'Errore interno di autenticazione.' });
    }
});

/**
 * POST /api/auth/mascot - Update mascot color
 */
router.post('/mascot', verifyToken, async (req, res) => {
    try {
        const { mascotColor } = req.body;
        if (!mascotColor) {
            return res.status(400).json({ error: 'Colore non fornito.' });
        }
        await runQuery('UPDATE users SET mascot_color = ? WHERE id = ?', [mascotColor, req.user.id]);
        res.json({ success: true, mascotColor });
    } catch (err) {
        console.error('Update mascot color error:', err);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento del colore.' });
    }
});

export default router;
