// backend/middleware/upload.js
const cloudinary              = require('cloudinary').v2;
const { CloudinaryStorage }   = require('multer-storage-cloudinary');
const multer                  = require('multer');

// ── Configure Cloudinary ────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Cloudinary storage engine ───────────────────────────────
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         'writeza',          // folder name in your Cloudinary account
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }],  // auto-resize large images
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max
});

module.exports = upload;