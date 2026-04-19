// backend/routes/admin.routes.js
const express       = require('express');
const router        = express.Router();
const User          = require('../models/User');
const Post          = require('../models/Post');
const Comment       = require('../models/Comment');
const Contact       = require('../models/Contact');
const { protect }   = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ── GET /api/admin/stats ────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const [members, posts, comments, messages] = await Promise.all([
            User.countDocuments({ role: 'member' }),
            Post.countDocuments(),
            Comment.countDocuments(),
            Contact.countDocuments({ read: false }),
        ]);
        res.json({ members, posts, comments, messages });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/admin/users ────────────────────────────────────
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUT /api/admin/users/:id/deactivate ─────────────────────
router.put('/users/:id/deactivate', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Cannot deactivate admin accounts' });
        user.status = user.status === 'active' ? 'inactive' : 'active';
        await user.save();
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/admin/create-admin ────────────────────────────
// Create a new admin account
router.post('/create-admin', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password)
            return res.status(400).json({ message: 'Name, email and password are required.' });
        if (password.length < 6)
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'An account with that email already exists.' });
        const newAdmin = await User.create({ name, email, password, role: 'admin', status: 'active' });
        const safe     = await User.findById(newAdmin._id).select('-password');
        res.status(201).json({ message: `Admin account for "${name}" created successfully.`, user: safe });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/admin/posts ────────────────────────────────────
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'name email').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/admin/posts/:id ─────────────────────────────
router.delete('/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ post: req.params.id });
        res.json({ message: 'Post and its comments deleted.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/admin/comments ─────────────────────────────────
router.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('author', 'name')
            .populate('post', 'title')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/admin/comments/:id ─────────────────────────
router.delete('/comments/:id', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Comment deleted.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/admin/contacts ─────────────────────────────────
router.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUT /api/admin/contacts/:id/read ───────────────────────
router.put('/contacts/:id/read', async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        res.json(contact);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;