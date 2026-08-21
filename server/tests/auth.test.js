import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';

import connectDB from '../config/db.js';

describe('Auth API Endpoints', () => {
  let amitToken = '';
  let rahulToken = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    
    // Ensure seeded users exist
    const amit = await User.findOne({ email: 'amit@example.com' });
    if (!amit) {
      await User.create({
        name: 'Amit Ahir',
        email: 'amit@example.com',
        password: 'Amit@123',
      });
    }

    const rahul = await User.findOne({ email: 'rahul@example.com' });
    if (!rahul) {
      await User.create({
        name: 'Rahul Shah',
        email: 'rahul@example.com',
        password: 'Rahul@123',
      });
    }
  });

  // Test 1: Amit login
  it('POST /api/auth/login - should authenticate Amit successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'amit@example.com',
        password: 'Amit@123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('amit@example.com');
    expect(res.body.user.name).toBe('Amit Ahir');
    expect(res.body.user).not.toHaveProperty('password');

    amitToken = res.body.token;
  });

  // Test 2: Rahul login
  it('POST /api/auth/login - should authenticate Rahul successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rahul@example.com',
        password: 'Rahul@123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('rahul@example.com');
    expect(res.body.user.name).toBe('Rahul Shah');

    rahulToken = res.body.token;
  });

  // Test 3: Wrong password
  it('POST /api/auth/login - should reject invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'amit@example.com',
        password: 'WrongPassword123',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password.');
  });

  // Test 4: GET /api/auth/me with Amit token
  it('GET /api/auth/me - should return authenticated user profile with valid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${amitToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('amit@example.com');
    expect(res.body.user.name).toBe('Amit Ahir');
  });

  // Test 5: GET /api/auth/me without token
  it('GET /api/auth/me - should reject request without token with 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  // Test 6: Registration - POST /api/auth/register success
  it('POST /api/auth/register - should create a new user account successfully', async () => {
    await User.deleteOne({ email: 'newtestuser@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Registration User',
        email: 'newtestuser@example.com',
        password: 'TestPassword@123',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.name).toBe('Test Registration User');
    expect(res.body.user.email).toBe('newtestuser@example.com');
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  // Test 7: Registration - POST /api/auth/register duplicate email conflict
  it('POST /api/auth/register - should reject duplicate email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Test',
        email: 'newtestuser@example.com',
        password: 'TestPassword@123',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('An account with this email already exists.');
  });
});
