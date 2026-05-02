module.exports = function (requiredRole) {
  return (req, res, next) => {
    try {
      if (!req.user)
        return res
          .status(401)
          .json({ success: false, message: "Not authenticated" });
      const userRole = req.user.role;
      if (!requiredRole) return next();
      if (Array.isArray(requiredRole)) {
        if (!requiredRole.includes(userRole))
          return res.status(403).json({ success: false, message: "Forbidden" });
        return next();
      }
      if (userRole !== requiredRole)
        return res.status(403).json({ success: false, message: "Forbidden" });
      next();
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
};
