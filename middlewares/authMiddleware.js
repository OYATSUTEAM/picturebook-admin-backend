const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config/auth');



// Authorization Middleware

const authMiddleware = (req, res, next) => {

  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {

    return res.status(401).json({ message: 'No token provided or invalid format.' });

  }

  const token = authHeader.split(' ')[1];

  if (!token) {

    return res.status(401).json({ message: 'Token not found.' });

  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {

    if (err) {

      console.log('Token verification failed:', err);

      return res.status(403).json({ message: 'Failed to authenticate token.' });

    }

    req.userId = decoded.userId;

    console.log("successfully verified in authMiddleware")

    next();

  });

};



module.exports = authMiddleware;

