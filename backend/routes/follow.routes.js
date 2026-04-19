// backend/routes/follow.routes.js
const express     = require('express');
const router      = express.Router();
const User        = require('../models/User');
const { protect } = require('../middleware/auth.middleware');

// ── POST /api/follow/:userId ────────────────────────────────
// Follow or unfollow a user (auth required)
router.post('/:userId', protect, async (req, res) => {
    try {
        const targetId = req.params.userId;
        const myId     = req.user._id.toString();

        if (targetId === myId)
            return res.status(400).json({ message: "You can't follow yourself." });

        const target = await User.findById(targetId);
        const me     = await User.findById(myId);
        if (!target || !me) return res.status(404).json({ message: 'User not found' });

        const isFollowing = (target.followers || []).some(id => id.toString() === myId);

        if (isFollowing) {
            target.followers = target.followers.filter(id => id.toString() !== myId);
            me.following     = me.following.filter(id => id.toString() !== targetId);
        } else {
            target.followers.push(me._id);
            me.following.push(target._id);
        }

        await target.save();
        await me.save();

        res.json({
            following:      !isFollowing,
            followerCount:  target.followers.length,
            followingCount: me.following.length,
        });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// ── GET /api/follow/:userId ─────────────────────────────────
// Get follow status + counts (auth required)
router.get('/:userId', protect, async (req, res) => {
    try {
        const target = await User.findById(req.params.userId);
        if (!target) return res.status(404).json({ message: 'User not found' });
        const myId = req.user._id.toString();
        res.json({
            following:      (target.followers || []).some(id => id.toString() === myId),
            followerCount:  (target.followers || []).length,
            followingCount: (target.following || []).length,
        });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// ── GET /api/follow/:userId/stats ───────────────────────────
// Public stats (no auth needed)
router.get('/:userId/stats', async (req, res) => {
    try {
        const target = await User.findById(req.params.userId);
        if (!target) return res.status(404).json({ message: 'User not found' });
        res.json({
            followerCount:  (target.followers || []).length,
            followingCount: (target.following || []).length,
        });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;