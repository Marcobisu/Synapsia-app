import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'synapsia-super-secret-key-12345';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Accesso negato: Token non fornito.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Contains { id, email }
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token non valido o scaduto.' });
    }
};
