// backend/models/PasswordReset.js
const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code:      { type: String, required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('PasswordReset', PasswordResetSchema);