// backend/routes/post.routes.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const { upload } = require('../config/cloudinary');

// ── GET /api/posts ──────────────────────────────────────────
// Get all published posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'published' })
            .populate('author', 'name profilePic')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// ── GET /api/posts/my ───────────────────────────────────────
// Get current user's posts
router.get('/my', protect, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id })
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// ── GET /api/posts/:id ──────────────────────────────────────
// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name profilePic');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// ── POST /api/posts ─────────────────────────────────────────
// Create post with Cloudinary image upload
router.post('/', protect, memberOrAdmin, (req, res, next) => {
    upload.single('image')(req, res, function(err) {
        if (err) {
            console.error('Cloudinary upload error:', err);
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        console.log('Creating post with Cloudinary...');
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);
        
        const { title, body, category, status } = req.body;
        
        // Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (!body || !body.trim()) {
            return res.status(400).json({ message: 'Content is required' });
        }
        
        // Get image URL from Cloudinary if uploaded
        let imageUrl = '';
        if (req.file) {
            imageUrl = req.file.path;
            console.log('Image uploaded to Cloudinary:', imageUrl);
        }
        
        // Create post
        const post = await Post.create({
            title: title.trim(),
            body: body.trim(),
            author: req.user._id,
            image: imageUrl,
            category: category || 'General',
            status: status || 'published',
        });
        
        const populated = await Post.findById(post._id).populate('author', 'name profilePic');
        res.status(201).json(populated);
    } catch (err) { 
        console.error('Error creating post:', err);
        res.status(500).json({ message: err.message }); 
    }
});

// ── PUT /api/posts/:id ──────────────────────────────────────
// Update post
router.put('/:id', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isOwner = post.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update fields
        if (req.body.title !== undefined) post.title = req.body.title.trim();
        if (req.body.body !== undefined) post.body = req.body.body.trim();
        if (req.body.category !== undefined) post.category = req.body.category;
        if (req.body.status !== undefined) post.status = req.body.status;

        // Update image if new one uploaded
        if (req.file) {
            post.image = req.file.path;
        }

        await post.save();
        
        const populated = await Post.findById(post._id).populate('author', 'name profilePic');
        res.json(populated);
    } catch (err) { 
        console.error('Error updating post:', err);
        res.status(500).json({ message: err.message }); 
    }
});

// ── PUT /api/posts/:id/read ─────────────────────────────────
// Increment read count
router.put('/:id/read', async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, { $inc: { readCount: 1 } });
        res.json({ ok: true });
    } catch (err) { 
        res.status(500).json({ message: 'Error' }); 
    }
});

// ── DELETE /api/posts/:id ───────────────────────────────────
// Delete post
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isOwner = post.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

module.exports = router;