import mongoose from 'mongoose';
import Document from '../models/Document.js';
import Share from '../models/Share.js';

// @desc    Create a new document
// @route   POST /api/documents
// @access  Private
export const createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (title !== undefined && typeof title === 'string' && title.trim() === '') {
      return res.status(400).json({ message: 'Title cannot be empty.' });
    }

    const documentTitle = title && title.trim() ? title.trim() : 'Untitled Document';
    const documentContent = content !== undefined ? content : '';

    const document = await Document.create({
      title: documentTitle,
      content: documentContent,
      owner: req.user._id,
    });

    return res.status(201).json({ document });
  } catch (error) {
    console.error(`Create document error: ${error.message}`);
    return res.status(500).json({ message: 'Server error creating document.' });
  }
};

// @desc    Get user's owned documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user._id }).sort({ updatedAt: -1 });
    return res.status(200).json({ documents });
  } catch (error) {
    console.error(`Get documents error: ${error.message}`);
    return res.status(500).json({ message: 'Server error retrieving documents.' });
  }
};

// @desc    Get single document by ID (Owner OR Shared User)
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const document = await Document.findById(id).populate({ path: 'owner', select: 'name email' });

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const isOwner = document.owner._id.toString() === req.user._id.toString();
    let isShared = false;

    if (!isOwner) {
      const shareRecord = await Share.findOne({
        document: id,
        sharedWith: req.user._id,
      });
      if (shareRecord) {
        isShared = true;
      }
    }

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: "You don't have access to this document." });
    }

    return res.status(200).json({
      document: {
        id: document._id,
        title: document.title,
        content: document.content,
        owner: {
          id: document.owner._id,
          name: document.owner.name,
          email: document.owner.email,
        },
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
      isOwner,
    });
  } catch (error) {
    console.error(`Get single document error: ${error.message}`);
    return res.status(500).json({ message: 'Server error retrieving document.' });
  }
};

// @desc    Update document title and/or content (Owner OR Shared User)
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const isOwner = document.owner.toString() === req.user._id.toString();
    let isShared = false;

    if (!isOwner) {
      const shareRecord = await Share.findOne({
        document: id,
        sharedWith: req.user._id,
      });
      if (shareRecord) {
        isShared = true;
      }
    }

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: "You don't have access to this document." });
    }

    if (title !== undefined && typeof title === 'string' && title.trim() === '') {
      return res.status(400).json({ message: 'Title cannot be empty.' });
    }

    if (title !== undefined && title.trim() !== '') {
      document.title = title.trim();
    }

    if (content !== undefined) {
      document.content = content;
    }

    await document.save();

    return res.status(200).json({ document });
  } catch (error) {
    console.error(`Update document error: ${error.message}`);
    return res.status(500).json({ message: 'Server error updating document.' });
  }
};

// @desc    Delete document (Owner ONLY)
// @route   DELETE /api/documents/:id
// @access  Private (Owner only)
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the document owner can delete this document.' });
    }

    // Also delete associated shares
    await Share.deleteMany({ document: id });
    await document.deleteOne();

    return res.status(200).json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error(`Delete document error: ${error.message}`);
    return res.status(500).json({ message: 'Server error deleting document.' });
  }
};
