/**
 * Role-based authorization middleware.
 * Usage: authorize('Super Admin', 'Admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.admin.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
