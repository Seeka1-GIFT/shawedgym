// Role-based authorization middleware
// Usage: authorizeRoles('admin'), authorizeRoles('admin', 'user')

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user || !user.role) {
        return res.status(401).json({ error: 'Unauthorized', message: 'No authenticated user' });
      }
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
      }
      next();
    } catch (e) {
      console.error('Authorize error:', e);
      res.status(500).json({ error: 'Server Error', message: 'Authorization failed' });
    }
  };
}

module.exports = { authorizeRoles };


