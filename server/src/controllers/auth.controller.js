const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');
const env = require('../config/env');

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.status(201).json({ success: true, data: { user, token: accessToken } });
});

const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.status(200).json({ success: true, data: { user, token: accessToken } });
});

const me = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

const logout = catchAsync(async (_req, res) => {
  res.clearCookie('refreshToken', cookieOptions);
  res.status(200).json({ success: true, message: 'Logged out' });
});

module.exports = { register, login, me, logout };
