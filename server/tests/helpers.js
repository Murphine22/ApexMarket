const request = require('supertest');
const createApp = require('../src/app');
const User = require('../src/models/User');
const { issueTokens } = require('../src/services/auth.service');

const app = createApp();

async function createUser(overrides = {}) {
  const user = await User.create({
    name: overrides.name || 'Test User',
    email: overrides.email || `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.io`,
    password: overrides.password || 'secret123',
    role: overrides.role || 'staff',
  });
  const { accessToken } = issueTokens(user);
  return { user, token: accessToken };
}

module.exports = { app, request, createUser };
