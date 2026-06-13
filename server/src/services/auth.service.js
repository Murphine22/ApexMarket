const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signAccessToken, signRefreshToken } = require('../utils/token');

function issueTokens(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function register({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered');

  // Only allow self-registration as staff by default; admins are seeded/promoted.
  const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'staff' });
  const tokens = issueTokens(user);
  return { user, ...tokens };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const match = await user.comparePassword(password);
  if (!match) throw ApiError.unauthorized('Invalid email or password');

  const tokens = issueTokens(user);
  return { user, ...tokens };
}

module.exports = { register, login, issueTokens };
