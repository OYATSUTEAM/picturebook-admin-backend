const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');

const userController = require('../controllers/userController');

const posterControllers = require('../controllers/posterController');

const upload = require('../middlewares/multer');

const {

    uploadVideoAndScreenshot,

    getVideos,

    searchVideos,

    getPosterVideos,

    isStaredVideo,

    searchVideoInString,

    getPermission

} = require('../controllers/VideoController');



router.post('/upload',
    authMiddleware,
    upload.fields([
        { name: 'video', maxCount: 1 },
        // { name: 'thumbnail', maxCount: 1 }
    ]),
    uploadVideoAndScreenshot
);


router.get('/public/uploads/video-sdf-1736441967387-511643579.mp4', (req, res) => {
    res.sendFile(`/public/uploads/video-sdf-1736441967387-511643579.mp4`);
})


router.post('/updateProfile',

    authMiddleware,

    upload.fields([

        { name: 'avatar', maxCount: 1 },

    ]),

    posterControllers.updateProfile);

router.post('/getVideos', authMiddleware, getVideos);

router.post('/getPosterVideos', authMiddleware, getPosterVideos);

router.post('/search', authMiddleware, searchVideos);

router.post('/getUsers', authMiddleware,  userController.getUsers);

router.post('/getPermission', authMiddleware,  userController.getPermission);

router.post('/sendAskMessage', authMiddleware, userController.sendAskMessage);

router.post('/isStaredVideo', authMiddleware, isStaredVideo);

router.post('/getUserMessage', authMiddleware, userController.getUserMessage);

router.post('/giveStartToVideo', authMiddleware, userController.giveStarToVideo);

router.post('/searchVideoInString', authMiddleware, searchVideoInString);

router.post('/readMessage', authMiddleware, userController.readMessage);

router.post('/submitReply', authMiddleware, userController.submitReply);



module.exports = router;