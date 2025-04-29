const express = require('express');

const {

    createNews,

    getNews,

    getVideoDetail,

    getAllVideos,

    updateVideo,

    getAllMessage,

    sendMessages,

    viewMessages,

    deleteAllChats,

    getAnalyseData,

    deleteUserById,

    searchUsersInString,
    
    blockThisUser,

    unBlockThisUser

} = require('../controllers/adminControllers');

const {  deleteVideoById } = require('../controllers/VideoController');



const router = express.Router();



router.post('/createNews', createNews);

router.post('/getNews', getNews);

router.post('/getAnalyseData', getAnalyseData);

router.post('/getVideoDetail', getVideoDetail);

router.post('/getAllVideos', getAllVideos);

router.post('/updateVideo', updateVideo);

router.post('/getAllMessage', getAllMessage);

router.post('/sendMessages', sendMessages);

router.post('/deleteUserById', deleteUserById);

router.post('/deleteVideoById', deleteVideoById);

router.post('/viewMessages', viewMessages);

router.post('/deleteAllChats', deleteAllChats);

router.post('/searchUsersInString', searchUsersInString);

router.post('/blockThisUser', blockThisUser);

router.post('/unBlockThisUser', unBlockThisUser);



module.exports = router;