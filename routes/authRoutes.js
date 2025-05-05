const express = require('express');

const { register, login, forgotPassword, initialize, isMe } = require('../controllers/authController');

const router = express.Router();



router.get('/', initialize);

router.post('/me', isMe);

router.post('/register', register);

router.post('/login', login);

router.post('/forgotPassword', forgotPassword);



module.exports = router;