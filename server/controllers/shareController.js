import mongoose from 'mongoose';
import Share from '../models/Share.js';
import Document from '../models/Document.js';
import User from '../models/User.js';

// @desc    Share a document with another user by email
// @route   POST /api/documents/:id/share
// @access  Private (Owner only)
export const shareDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Only document owner can share
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the document owner can share this document.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const targetUser = await User.findOne({ email: normalizedEmail });

    if (!targetUser) {
      return res.status(404).json({ message: 'No user found with this email.' });
    }

    // Prevent self-sharing
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You already own this document.' });
    }

    // Check duplicate share
    const existingShare = await Share.findOne({
      document: id,
      sharedWith: targetUser._id,
    });

    if (existingShare) {
      return res.status(400).json({ message: 'Document is already shared with this user.' });
    }

    const share = await Share.create({
      document: id,
      owner: req.user._id,
      sharedWith: targetUser._id,
    });

    return res.status(201).json({
      share,
      message: 'Document shared successfully.',
    });
  } catch (error) {
    console.error(`Share document error: ${error.message}`);
    return res.status(500).json({ message: 'Server error sharing document.' });
  }
};

// @desc    Get documents shared with the authenticated user
// @route   GET /api/documents/shared
// @access  Private
export const getSharedDocuments = async (req, res) => {
  try {
    const shares = await Share.find({ sharedWith: req.user._id })
      .populate({ path: 'document' })
      .populate({ path: 'owner', select: 'name email' })
      .sort({ updatedAt: -1 });

    const documents = shares
      .filter((share) => share.document)
      .map((share) => ({
        id: share.document._id,
        title: share.document.title,
        content: share.document.content,
        updatedAt: share.document.updatedAt,
        createdAt: share.document.createdAt,
        owner: {
          id: share.owner._id,
          name: share.owner.name,
          email: share.owner.email,
        },
      }));

    return res.status(200).json({ documents });
  } catch (error) {
    console.error(`Get shared documents error: ${error.message}`);
    return res.status(500).json({ message: 'Server error retrieving shared documents.' });
  }
};

// @desc    Get users a document is shared with
// @route   GET /api/documents/:id/shares
// @access  Private (Owner only)
export const getDocumentShares = async (req, res) => {
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
      return res.status(403).json({ message: 'Only the document owner can view document shares.' });
    }

    const shares = await Share.find({ document: id }).populate({
      path: 'sharedWith',
      select: 'name email',
    });

    const sharedUsers = shares.map((s) => ({
      id: s._id,
      user: {
        id: s.sharedWith._id,
        name: s.sharedWith.name,
        email: s.sharedWith.email,
      },
    }));

    return res.status(200).json({ shares: sharedUsers });
  } catch (error) {
    console.error(`Get document shares error: ${error.message}`);
    return res.status(500).json({ message: 'Server error retrieving shares.' });
  }
};
