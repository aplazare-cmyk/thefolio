// backend/models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title:     { type: String, required: true },
    body:      { type: String, required: true },
    author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image:     { type: String, default: '' },
    category:  { type: String, default: '' },
    status:    { type: String, enum: ['published', 'draft', 'removed'], default: 'published' },
    likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    readCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);