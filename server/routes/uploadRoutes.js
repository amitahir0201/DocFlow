import express from 'express';
import multer from 'multer';
import upload from '../middleware/uploadMiddleware.js';
import { uploadFile } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware wrapper to handle Multer errors cleanly
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum size is 5 MB.' });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ message: 'Only .txt and .md files are supported.' });
      }
      return res.status(400).json({ message: err.message || 'Error uploading file.' });
    }
    next();
  });
};

router.post('/', protect, handleUpload, uploadFile);

export default router;
