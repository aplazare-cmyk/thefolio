// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name:       { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    password:   { type: String, required: true },
    role:       { type: String, enum: ['member', 'admin'], default: 'member' },
    status:     { type: String, enum: ['active', 'inactive'], default: 'active' },
    bio:        { type: String, default: '' },
    profilePic: { type: String, default: '' },
    followers:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare entered password with hashed
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);