// backend/routes/post.routes.js
const express           = require('express');
const router            = express.Router();
const Post              = require('../models/Post');
const { protect }       = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const upload            = require('../middleware/upload');

// ── GET /api/posts ──────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'published' })
            .populate('author', 'name profilePic')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/posts/my ───────────────────────────────────────
router.get('/my', protect, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/posts/:id ──────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'name profilePic');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/posts ─────────────────────────────────────────
router.post('/', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
    try {
        const { title, body, category, status } = req.body;

        // Cloudinary gives us req.file.path (full URL) instead of just a filename
        const imageUrl = req.file ? req.file.path : '';

        const post = await Post.create({
            title,
            body,
            author:   req.user._id,
            image:    imageUrl,
            category: category || '',
            status:   status   || 'published',
        });
        const populated = await Post.findById(post._id).populate('author', 'name profilePic');
        res.status(201).json(populated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUT /api/posts/:id ──────────────────────────────────────
router.put('/:id', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isOwner = post.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

        if (req.body.title)                  post.title    = req.body.title;
        if (req.body.body)                   post.body     = req.body.body;
        if (req.body.category !== undefined) post.category = req.body.category;
        if (req.body.status)                 post.status   = req.body.status;

        // Cloudinary: req.file.path is the full URL
        if (req.file) {
            post.image = req.file.path;
        } else if (req.body.image === '') {
            post.image = '';
        }

        await post.save();
        res.json(post);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUT /api/posts/:id/read ─────────────────────────────────
router.put('/:id/read', async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, { $inc: { readCount: 1 } });
        res.json({ ok: true });
    } catch { res.status(500).json({ message: 'Error' }); }
});

// ── DELETE /api/posts/:id ───────────────────────────────────
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isOwner = post.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;