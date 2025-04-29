const jwt = require('jsonwebtoken');

exports.generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30h' });
};