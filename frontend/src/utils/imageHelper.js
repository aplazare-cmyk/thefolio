// frontend/src/utils/imageHelper.js

/**
 * Returns the correct image URL whether it's:
 *  - A full Cloudinary URL (starts with https://)
 *  - A local filename (old uploads, for backwards compat)
 *  - Empty / null → returns null
 */
export function getImageUrl(image) {
    if (!image) return null;
    // Already a full URL (Cloudinary or any https)
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    // Legacy local file from before Cloudinary migration
    return `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${image}`;
}