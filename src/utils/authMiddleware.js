const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'Access denied. Token not provided or format incorrect.'
      });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            error: true,
            message: 'Invalid token.'
          });
        } else if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: true,
            message: 'Expired token.'
          });
        } else {
          return res.status(500).json({
            error: true,
            message: 'Internal error when checking token'
          });
        }
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Unexpected error in authentication middleware:', error.message);
    return res.status(500).json({
      error: true,
      message: 'Internal authentication error.'
    });
  }
};

module.exports = authMiddleware;