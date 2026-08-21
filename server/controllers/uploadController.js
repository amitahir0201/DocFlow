import path from 'path';
import Document from '../models/Document.js';

// Helper to escape HTML characters
const escapeHTML = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Helper to convert plain text / markdown into TipTap-compatible HTML
const convertTextToHTML = (text, isMarkdown) => {
  if (!text || !text.trim()) return '<p></p>';

  const lines = text.split(/\r?\n/);

  if (!isMarkdown) {
    // Standard TXT: wrap lines in <p>
    return lines
      .map((line) => {
        const escaped = escapeHTML(line);
        return `<p>${escaped}</p>`;
      })
      .join('');
  }

  // Simple Markdown processing:
  const htmlLines = [];
  let inBulletList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (inBulletList) {
        htmlLines.push('</ul>');
        inBulletList = false;
      }
      if (inOrderedList) {
        htmlLines.push('</ol>');
        inOrderedList = false;
      }
      htmlLines.push('<p></p>');
      continue;
    }

    // Heading 1 (# Heading)
    if (trimmed.startsWith('# ')) {
      if (inBulletList) {
        htmlLines.push('</ul>');
        inBulletList = false;
      }
      if (inOrderedList) {
        htmlLines.push('</ol>');
        inOrderedList = false;
      }
      const content = escapeHTML(trimmed.slice(2));
      htmlLines.push(`<h1>${content}</h1>`);
      continue;
    }

    // Heading 2 (## Heading)
    if (trimmed.startsWith('## ')) {
      if (inBulletList) {
        htmlLines.push('</ul>');
        inBulletList = false;
      }
      if (inOrderedList) {
        htmlLines.push('</ol>');
        inOrderedList = false;
      }
      const content = escapeHTML(trimmed.slice(3));
      htmlLines.push(`<h2>${content}</h2>`);
      continue;
    }

    // Bullet List (- Item or * Item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inOrderedList) {
        htmlLines.push('</ol>');
        inOrderedList = false;
      }
      if (!inBulletList) {
        htmlLines.push('<ul>');
        inBulletList = true;
      }
      const content = escapeHTML(trimmed.slice(2));
      htmlLines.push(`<li>${content}</li>`);
      continue;
    }

    // Ordered List (1. Item)
    const matchOrdered = trimmed.match(/^\d+\.\s+(.*)/);
    if (matchOrdered) {
      if (inBulletList) {
        htmlLines.push('</ul>');
        inBulletList = false;
      }
      if (!inOrderedList) {
        htmlLines.push('<ol>');
        inOrderedList = true;
      }
      const content = escapeHTML(matchOrdered[1]);
      htmlLines.push(`<li>${content}</li>`);
      continue;
    }

    // Normal Paragraph line
    if (inBulletList) {
      htmlLines.push('</ul>');
      inBulletList = false;
    }
    if (inOrderedList) {
      htmlLines.push('</ol>');
      inOrderedList = false;
    }

    const content = escapeHTML(trimmed);
    htmlLines.push(`<p>${content}</p>`);
  }

  if (inBulletList) htmlLines.push('</ul>');
  if (inOrderedList) htmlLines.push('</ol>');

  return htmlLines.join('');
};

// @desc    Upload .txt or .md file and convert to editable document
// @route   POST /api/upload
// @access  Private
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a file to upload.' });
    }

    const filename = req.file.originalname;
    const ext = path.extname(filename).toLowerCase();

    if (ext !== '.txt' && ext !== '.md') {
      return res.status(400).json({ message: 'Only .txt and .md files are supported.' });
    }

    const title = path.parse(filename).name || 'Untitled Document';
    const textContent = req.file.buffer.toString('utf-8');
    const isMarkdown = ext === '.md';
    const htmlContent = convertTextToHTML(textContent, isMarkdown);

    const document = await Document.create({
      title,
      content: htmlContent,
      owner: req.user._id,
    });

    return res.status(201).json({ document });
  } catch (error) {
    console.error(`Upload error: ${error.message}`);
    return res.status(500).json({ message: 'Server error uploading file.' });
  }
};
