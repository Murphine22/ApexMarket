const ApiError = require('../utils/ApiError');

// Role-Based Access Control: restricts a route to the given roles.
// Usage: router.post('/', authenticate, authorize('admin'), handler)
const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };

module.exports = { authorize };
