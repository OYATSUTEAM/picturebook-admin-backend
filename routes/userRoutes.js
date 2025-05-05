const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');

const userController = require('../controllers/userController');

const posterControllers = require('../controllers/posterController');

const upload = require('../middlewares/multer');

router.post('/updateProfile',

    authMiddleware,

    upload.fields([

        { name: 'avatar', maxCount: 1 },

    ]),

    posterControllers.updateProfile);


router.post('/list', authMiddleware, userController.getUsers);



module.exports = router;