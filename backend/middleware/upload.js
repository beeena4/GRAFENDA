const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types (based on extension and/or mimetype)
  // Requirement: “buat semua format bisa” => longgarkan filter jadi tidak memblok file.
  // Tetap pertahankan batas ukuran dari multer.
  return cb(null, true);
};

// Upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter
});

// Specific upload configurations
const uploadAvatar = upload.single('avatar');
const uploadPortfolio = upload.array('portfolio', 10); // Max 10 files
const uploadPaymentProof = upload.single('payment_proof');
const uploadServiceImages = upload.array('images', 5); // Max 5 images for service
const uploadChatFile = upload.single('file');
const uploadOrderResult = upload.single('result_image');

module.exports = {
  upload,
  uploadAvatar,
  uploadPortfolio,
  uploadPaymentProof,
  uploadServiceImages,
  uploadChatFile,
  uploadOrderResult
};