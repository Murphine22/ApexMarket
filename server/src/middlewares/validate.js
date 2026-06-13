const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs express-validator chains then collects any errors.
const validate = (validations) => async (req, _res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  return next(ApiError.badRequest('Validation failed', details));
};

module.exports = { validate };
