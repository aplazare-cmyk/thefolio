// backend/routes/contact.routes.js
const express  = require('express');
const router   = express.Router();
const Contact  = require('../models/Contact');

// ── POST /api/contact ───────────────────────────────────────
// Save a contact message (public)
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        if (!name || !email || !message)
            return res.status(400).json({ message: 'All fields are required.' });
        const contact = await Contact.create({ name, email, message });
        res.status(201).json({ message: 'Message received!', contact });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/contact ────────────────────────────────────────
// Get all messages (admin only — protected in admin.routes)
router.get('/', async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUT /api/contact/:id/read ───────────────────────────────
// Mark message as read
router.put('/:id/read', async (req, res) => {
    try {
        const msg = await Contact.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        res.json(msg);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;