import multer from 'multer';
import path from 'path';

// Use Memory Storage so file buffers are processed directly in memory
const storage = multer.memoryStorage();

// File filter function for .txt and .md files only
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.txt' || ext === '.md') {
    cb(null, true);
  } else {
    // Custom error object for invalid file type
    const err = new Error('Only .txt and .md files are supported.');
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter,
});

export default upload;
