// backend/routes/likes.routes.js
const express     = require('express');
const router      = express.Router();
const Post        = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');

// ── POST /api/likes/:postId ─────────────────────────────────
// Toggle like on a post (auth required)
router.post('/:postId', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user._id.toString();
        const likes  = post.likes || [];
        const idx    = likes.findIndex(id => id.toString() === userId);

        if (idx === -1) {
            likes.push(req.user._id);
        } else {
            likes.splice(idx, 1);
        }

        post.likes = likes;
        await post.save();

        res.json({ likes: post.likes.length, liked: idx === -1 });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// ── GET /api/likes/:postId ──────────────────────────────────
// Get like status + count (auth required)
router.get('/:postId', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        const userId = req.user._id.toString();
        const likes  = post.likes || [];
        res.json({
            likes: likes.length,
            liked: likes.some(id => id.toString() === userId),
        });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;