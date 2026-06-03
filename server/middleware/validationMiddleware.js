/**
 * Validation Middleware for Synapsia API requests
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req, res, next) {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Il nome completo è obbligatorio.' });
    }

    if (!email || !email.trim()) {
        return res.status(400).json({ error: 'L\'indirizzo email è obbligatorio.' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'L\'indirizzo email non è valido.' });
    }

    if (!password || password.length < 8) {
        return res.status(400).json({ error: 'La password deve essere lunga almeno 8 caratteri.' });
    }

    next();
}

export function validateLogin(req, res, next) {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
        return res.status(400).json({ error: 'L\'indirizzo email è obbligatorio.' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'L\'indirizzo email non è valido.' });
    }

    if (!password) {
        return res.status(400).json({ error: 'La password è obbligatoria.' });
    }

    next();
}

export function validateAnalyzeText(req, res, next) {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Il materiale didattico testuale non può essere vuoto.' });
    }

    next();
}
