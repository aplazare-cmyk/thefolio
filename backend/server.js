// backend/server.js
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('./config/db');

// ── Routes ─────────────────────────────────────────────────
const authRoutes    = require('./routes/auth.routes');
const postRoutes    = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes   = require('./routes/admin.routes');
const contactRoutes = require('./routes/contact.routes');
const likesRoutes   = require('./routes/likes.routes');
const followRoutes  = require('./routes/follow.routes');

const app = express();

// ── Connect to MongoDB ──────────────────────────────────────
connectDB();

// ── Middleware ──────────────────────────────────────────────
// Enable preflight for all routes
app.options('*', cors());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://thefolio-ochre.vercel.app',
    'https://thefolio-git-main-aplazare-cmyks-projects.vercel.app',
    'https://thefolio-hyitsign-aplazare-cmyks-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// Increase payload limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static uploads folder ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/posts',    postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/likes',    likesRoutes);
app.use('/api/follow',   followRoutes);

// ── Health check ────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'Writeza API is running ✅' }));

// ── Error handling middleware ───────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ── Start server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});