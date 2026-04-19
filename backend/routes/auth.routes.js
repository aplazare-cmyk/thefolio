// backend/routes/auth.routes.js
const express       = require('express');
const jwt           = require('jsonwebtoken');
const User          = require('../models/User');
const Post          = require('../models/Post');
const Comment       = require('../models/Comment');
const PasswordReset = require('../models/PasswordReset');
const { protect }   = require('../middleware/auth.middleware');
const upload        = require('../middleware/upload');

const router = express.Router();

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── POST /api/auth/register ─────────────────────────────────
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email is already registered' });
        const user = await User.create({ name, email, password });
        res.status(201).json({
            token: generateToken(user._id),
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/auth/login ────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });
        if (user.status === 'inactive')
            return res.status(403).json({ message: 'Your account is deactivated. Please contact the admin.' });
        const match = await user.matchPassword(password);
        if (!match) return res.status(400).json({ message: 'Invalid email or password' });
        res.json({
            token: generateToken(user._id),
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, profilePic: user.profilePic }
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/auth/me ────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
});

// ── PUT /api/auth/profile ───────────────────────────────────
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (req.body.name) user.name = req.body.name;
        if (req.body.bio !== undefined) user.bio = req.body.bio;
        if (req.file) user.profilePic = req.file.filename;
        await user.save();
        const updated = await User.findById(user._id).select('-password');
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUT /api/auth/change-password ───────────────────────────
router.put('/change-password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user  = await User.findById(req.user._id);
        const match = await user.matchPassword(currentPassword);
        if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/auth/deactivate ───────────────────────────────
router.post('/deactivate', protect, async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const match = await user.matchPassword(password);
        if (!match) return res.status(400).json({ message: 'Incorrect password. Please try again.' });
        const userId = user._id;
        await Comment.deleteMany({ author: userId });
        await Post.deleteMany({ author: userId });
        await User.findByIdAndDelete(userId);
        res.json({ message: 'Account permanently deleted.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/auth/forgot-password ─────────────────────────
// Generates a 6-digit code and returns it to frontend (EmailJS sends the email)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.json({ sent: false, message: 'No account found with that email.' });

        await PasswordReset.deleteMany({ userId: user._id });

        const code      = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await PasswordReset.create({ userId: user._id, code, expiresAt });

        // Always log to terminal for development
        console.log(`\n==============================`);
        console.log(`🔑 RESET CODE for ${email}: ${code}`);
        console.log(`⏱  Expires: ${expiresAt.toLocaleTimeString()}`);
        console.log(`==============================\n`);

        res.json({ sent: true, code, userName: user.name });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
});

// ── POST /api/auth/verify-code ──────────────────────────────
router.post('/verify-code', async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid code.' });
        const record = await PasswordReset.findOne({ userId: user._id, code });
        if (!record) return res.status(400).json({ message: 'Invalid code. Please check and try again.' });
        if (record.expiresAt < new Date()) return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
        res.json({ valid: true, resetToken });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/auth/reset-password ──────────────────────────
router.post('/reset-password', async (req, res) => {
    const { resetToken, password } = req.body;
    try {
        if (!password || password.length < 6)
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        let decoded;
        try { decoded = jwt.verify(resetToken, process.env.JWT_SECRET); }
        catch { return res.status(400).json({ message: 'Reset session expired. Please start over.' }); }
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.password = password;
        await user.save();
        await PasswordReset.deleteMany({ userId: user._id });
        res.json({ message: 'Password reset successfully! You can now log in.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/auth/user/:id ──────────────────────────────────
// Public profile lookup
router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'name profilePic')
            .populate('following', 'name profilePic');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;