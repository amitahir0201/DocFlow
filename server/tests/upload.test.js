import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';

import connectDB from '../config/db.js';

describe('File Upload API (POST /api/upload)', () => {
  let amitToken = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    let amit = await User.findOne({ email: 'amit@example.com' });
    if (!amit) {
      amit = await User.create({
        name: 'Amit Ahir',
        email: 'amit@example.com',
        password: 'Amit@123',
      });
    }

    const res = await request(app).post('/api/auth/login').send({
      email: 'amit@example.com',
      password: 'Amit@123',
    });
    amitToken = res.body.token;
  });

  // Test 1: Upload .txt file
  it('POST /api/upload - uploads .txt file and converts to document with filename title', async () => {
    const txtBuffer = Buffer.from('Hello Amit\nThis is my test document.', 'utf-8');

    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${amitToken}`)
      .attach('file', txtBuffer, 'resume.txt');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('document');
    expect(res.body.document.title).toBe('resume');
    expect(res.body.document.content).toContain('<p>Hello Amit</p>');
    expect(res.body.document.content).toContain('<p>This is my test document.</p>');
  });

  // Test 2: Upload .md file
  it('POST /api/upload - uploads .md file and converts headers/lists to HTML', async () => {
    const mdBuffer = Buffer.from('# My Notes\n## Subheader\n- React\n- Node.js', 'utf-8');

    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${amitToken}`)
      .attach('file', mdBuffer, 'notes.md');

    expect(res.status).toBe(201);
    expect(res.body.document.title).toBe('notes');
    expect(res.body.document.content).toContain('<h1>My Notes</h1>');
    expect(res.body.document.content).toContain('<h2>Subheader</h2>');
    expect(res.body.document.content).toContain('<li>React</li>');
    expect(res.body.document.content).toContain('<li>Node.js</li>');
  });

  // Test 3: Reject invalid file extension (.pdf)
  it('POST /api/upload - rejects .pdf files with 400 error', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 fake pdf content', 'utf-8');

    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${amitToken}`)
      .attach('file', pdfBuffer, 'document.pdf');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Only .txt and .md files are supported.');
  });

  // Test 4: Reject large files (> 5MB)
  it('POST /api/upload - rejects files exceeding 5 MB limit', async () => {
    const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024, 'a');

    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${amitToken}`)
      .attach('file', largeBuffer, 'large_file.txt');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('File is too large. Maximum size is 5 MB.');
  });

  // Test 5: Unauthenticated upload rejected
  it('POST /api/upload - rejects upload without authorization token with 401', async () => {
    const txtBuffer = Buffer.from('Test content', 'utf-8');

    const res = await request(app)
      .post('/api/upload')
      .attach('file', txtBuffer, 'unauthorized.txt');

    expect(res.status).toBe(401);
  });
});
