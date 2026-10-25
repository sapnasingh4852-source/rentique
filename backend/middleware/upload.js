const multer = require('multer');

// Memory storage keeps file buffers in memory for direct Cloudinary upload streaming
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow common image and video mime types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WEBP, MP4, WEBM`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size for videos/high-res images
  },
  fileFilter
});

module.exports = upload;
