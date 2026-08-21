import express from 'express';
import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/documentController.js';
import {
  shareDocument,
  getSharedDocuments,
  getDocumentShares,
} from '../controllers/shareController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all document routes
router.use(protect);

// IMPORTANT: /shared MUST be registered before /:id to prevent route collision
router.get('/shared', getSharedDocuments);

// Share management endpoints
router.post('/:id/share', shareDocument);
router.get('/:id/shares', getDocumentShares);

// Document CRUD endpoints
router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
