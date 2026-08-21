import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import Share from '../models/Share.js';

import connectDB from '../config/db.js';

describe('Document Sharing API & Authorization Matrix', () => {
  let amitToken = '';
  let rahulToken = '';
  let thirdUserToken = '';
  let sharedDocId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Authenticate Amit
    let amit = await User.findOne({ email: 'amit@example.com' });
    if (!amit) {
      amit = await User.create({
        name: 'Amit Ahir',
        email: 'amit@example.com',
        password: 'Amit@123',
      });
    }
    const amitRes = await request(app).post('/api/auth/login').send({
      email: 'amit@example.com',
      password: 'Amit@123',
    });
    amitToken = amitRes.body.token;

    // Authenticate Rahul
    let rahul = await User.findOne({ email: 'rahul@example.com' });
    if (!rahul) {
      rahul = await User.create({
        name: 'Rahul Shah',
        email: 'rahul@example.com',
        password: 'Rahul@123',
      });
    }
    const rahulRes = await request(app).post('/api/auth/login').send({
      email: 'rahul@example.com',
      password: 'Rahul@123',
    });
    rahulToken = rahulRes.body.token;

    // Create Third User
    let thirdUser = await User.findOne({ email: 'third@example.com' });
    if (!thirdUser) {
      thirdUser = await User.create({
        name: 'Third User',
        email: 'third@example.com',
        password: 'Third@123',
      });
    }
    const thirdRes = await request(app).post('/api/auth/login').send({
      email: 'third@example.com',
      password: 'Third@123',
    });
    thirdUserToken = thirdRes.body.token;

    // Create a document owned by Amit for sharing tests
    const doc = await Document.create({
      title: 'Amit Shared Proposal',
      content: '<h1>Project Proposal</h1><p>Confidential content</p>',
      owner: amit._id,
    });
    sharedDocId = doc._id.toString();
  });

  // Test 1: Amit shares document with Rahul
  it('POST /api/documents/:id/share - Amit shares document with Rahul', async () => {
    const res = await request(app)
      .post(`/api/documents/${sharedDocId}/share`)
      .set('Authorization', `Bearer ${amitToken}`)
      .send({ email: 'rahul@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('share');
    expect(res.body.message).toBe('Document shared successfully.');
  });

  // Test 2: Prevent duplicate share
  it('POST /api/documents/:id/share - rejects duplicate share to same user with 400', async () => {
    const res = await request(app)
      .post(`/api/documents/${sharedDocId}/share`)
      .set('Authorization', `Bearer ${amitToken}`)
      .send({ email: 'rahul@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Document is already shared with this user.');
  });

  // Test 3: Reject nonexistent user
  it('POST /api/documents/:id/share - rejects nonexistent user with 404', async () => {
    const res = await request(app)
      .post(`/api/documents/${sharedDocId}/share`)
      .set('Authorization', `Bearer ${amitToken}`)
      .send({ email: 'doesnotexist@example.com' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('No user found with this email.');
  });

  // Test 4: Prevent self-share
  it('POST /api/documents/:id/share - prevents owner from sharing with self', async () => {
    const res = await request(app)
      .post(`/api/documents/${sharedDocId}/share`)
      .set('Authorization', `Bearer ${amitToken}`)
      .send({ email: 'amit@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('You already own this document.');
  });

  // Test 5: GET /api/documents/shared returns document for Rahul
  it('GET /api/documents/shared - Rahul sees Amit document in Shared With Me', async () => {
    const res = await request(app)
      .get('/api/documents/shared')
      .set('Authorization', `Bearer ${rahulToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('documents');
    expect(res.body.documents.some((d) => d.id === sharedDocId)).toBe(true);
    const sharedDoc = res.body.documents.find((d) => d.id === sharedDocId);
    expect(sharedDoc.owner.name).toBe('Amit Ahir');
  });

  // Test 6: Rahul can view shared document
  it('GET /api/documents/:id - Rahul can view Amit shared document', async () => {
    const res = await request(app)
      .get(`/api/documents/${sharedDocId}`)
      .set('Authorization', `Bearer ${rahulToken}`);

    expect(res.status).toBe(200);
    expect(res.body.document.id).toBe(sharedDocId);
    expect(res.body.isOwner).toBe(false);
  });

  // Test 7: Rahul can edit/save shared document
  it('PUT /api/documents/:id - Rahul can edit/save shared document', async () => {
    const res = await request(app)
      .put(`/api/documents/${sharedDocId}`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({
        title: 'Amit Shared Proposal (Edited by Rahul)',
        content: '<h1>Project Proposal</h1><p>Edited by Rahul Shah</p>',
      });

    expect(res.status).toBe(200);
    expect(res.body.document.title).toBe('Amit Shared Proposal (Edited by Rahul)');
  });

  // Test 8: Rahul CANNOT delete shared document
  it('DELETE /api/documents/:id - Rahul is denied delete access with 403', async () => {
    const res = await request(app)
      .delete(`/api/documents/${sharedDocId}`)
      .set('Authorization', `Bearer ${rahulToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Only the document owner can delete this document.');
  });

  // Test 9: Rahul CANNOT re-share shared document
  it('POST /api/documents/:id/share - Rahul is denied re-share access with 403', async () => {
    const res = await request(app)
      .post(`/api/documents/${sharedDocId}/share`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({ email: 'third@example.com' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Only the document owner can share this document.');
  });

  // Test 10: Unrelated user blocked
  it('GET /api/documents/:id - Unrelated third user is denied access with 403', async () => {
    const res = await request(app)
      .get(`/api/documents/${sharedDocId}`)
      .set('Authorization', `Bearer ${thirdUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You don't have access to this document.");
  });
});
