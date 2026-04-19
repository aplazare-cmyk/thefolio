// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: 'dcozfqksz',
    api_key: '613342263797397',
    api_secret: 'IuZroQABd2ysAbqFV'
});

// Configure storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'thefolio_posts',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        transformation: [{ width: 1200, height: 630, crop: 'limit' }]
    }
});

// Create multer upload instance
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = { cloudinary, upload };