const multer = require('multer');
const path = require('path');

// SWITCH KE MEMORY STORAGE (Wajib agar Vercel tidak error EROFS)
const storage = multer.memoryStorage();

// File filter (Tetap melonggarkan semua format sesuai request timmu)
const fileFilter = (req, file, cb) => {
  return cb(null, true);
};

// Instance utama Multer menggunakan memory storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter
});

// Konfigurasi spesifik (Variabel ekspor dipertahankan agar codingan Route tidak pecah)
const uploadAvatar = upload.single('avatar');
const uploadPortfolio = upload.array('portfolio', 10); // Max 10 files
const uploadPaymentProof = upload.single('payment_proof');
const uploadServiceImages = upload.array('images', 5); // Max 5 images
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