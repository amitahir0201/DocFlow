import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Document from '../models/Document.js';

describe('Document API Endpoints & Authorization', () => {
  let amitToken = '';
  let rahulToken = '';
  let amitUser = null;
  let createdDocId = '';

  beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/docflow';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
    }

    // Clear existing docs for clean test runs
    await Document.deleteMany({});

    // Authenticate Amit
    amitUser = await User.findOne({ email: 'amit@example.com' });
    if (!amitUser) {
      amitUser = await User.create({
        name: 'Amit Ahir',
        email: 'amit@example.com',
        password: 'Amit@123',
      });
    }
    const amitLogin = await request(app).post('/api/auth/login').send({
      email: 'amit@example.com',
      password: 'Amit@123',
    });
    amitToken = amitLogin.body.token;

    // Authenticate Rahul
    let rahul = await User.findOne({ email: 'rahul@example.com' });
    if (!rahul) {
      rahul = await User.create({
        name: 'Rahul Shah',
        email: 'rahul@example.com',
        password: 'Rahul@123',
      });
    }
    const rahulLogin = await request(app).post('/api/auth/login').send({
      email: 'rahul@example.com',
      password: 'Rahul@123',
    });
    rahulToken = rahulLogin.body.token;
  });

  // Step 9 Required Integration Test: Create document for authenticated user
  it('POST /api/documents - creates a document for an authenticated user with correct owner and DB verification', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${amitToken}`)
      .send({
        title: 'Automated Test Document',
        content: '<p>Hello from automated test</p>',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('document');
    expect(res.body.document.title).toBe('Automated Test Document');
    expect(res.body.document.content).toBe('<p>Hello from automated test</p>');
    expect(res.body.document.owner).toBe(amitUser._id.toString());

    createdDocId = res.body.document.id;

    // Direct Database Verification via Mongoose
    const dbDoc = await Document.findById(createdDocId);
    expect(dbDoc).not.toBeNull();
    expect(dbDoc.title).toBe('Automated Test Document');
    expect(dbDoc.owner.toString()).toBe(amitUser._id.toString());
  });

  // Test 2: List documents
  it('GET /api/documents - Amit gets list of owned documents', async () => {
    const res = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${amitToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('documents');
    expect(Array.isArray(res.body.documents)).toBe(true);
    expect(res.body.documents.length).toBeGreaterThanOrEqual(1);
    expect(res.body.documents.some((d) => d.title === 'Automated Test Document')).toBe(true);
  });

  // Test 3: Get single document
  it('GET /api/documents/:id - Amit gets single owned document', async () => {
    const res = await request(app)
      .get(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${amitToken}`);

    expect(res.status).toBe(200);
    expect(res.body.document.id).toBe(createdDocId);
    expect(res.body.document.title).toBe('Automated Test Document');
  });

  // Test 4: Update document
  it('PUT /api/documents/:id - Amit updates owned document', async () => {
    const res = await request(app)
      .put(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${amitToken}`)
      .send({
        title: 'Updated Resume',
        content: '<h1>Updated Amit Resume</h1><p>Hello DocFlow</p>',
      });

    expect(res.status).toBe(200);
    expect(res.body.document.title).toBe('Updated Resume');
    expect(res.body.document.content).toBe('<h1>Updated Amit Resume</h1><p>Hello DocFlow</p>');
  });

  // Test 5: Reject empty title
  it('POST /api/documents - rejects empty title string', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${amitToken}`)
      .send({
        title: '   ',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Title cannot be empty.');
  });

  // Test 6: Rahul authorization (GET forbidden)
  it('GET /api/documents/:id - Rahul is denied access to Amit document', async () => {
    const res = await request(app)
      .get(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${rahulToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You don't have access to this document.");
  });

  // Test 7: Rahul authorization (PUT forbidden)
  it('PUT /api/documents/:id - Rahul is denied update access to Amit document', async () => {
    const res = await request(app)
      .put(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({
        title: 'Hacked Title',
      });

    expect(res.status).toBe(403);
  });

  // Test 8: Rahul authorization (DELETE forbidden)
  it('DELETE /api/documents/:id - Rahul is denied delete access to Amit document', async () => {
    const res = await request(app)
      .delete(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${rahulToken}`);

    expect(res.status).toBe(403);
  });

  // Test 9: Amit deletes document
  it('DELETE /api/documents/:id - Amit deletes owned document', async () => {
    const res = await request(app)
      .delete(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${amitToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Document deleted successfully.');
  });

  // Test 10: Unauthenticated request rejected
  it('GET /api/documents - rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(401);
  });
});
