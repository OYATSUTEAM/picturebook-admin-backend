const path = require('path');

const fs = require('fs');

const { v4: uuidv4 } = require('uuid');

const s3Client = require('../config/awsS3');

const { PutObjectCommand } = require('@aws-sdk/client-s3');

const Video = require('../models/Video');
const User = require('../models/User');



const deleteFileFromLocal = async (key) => {


    try {
        const fs = require('fs');

        const filePath = `public/${key}`; // Replace with the actual path to your file

        // Remove the file
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error removing file: ${err}`);
                return;
            }

            console.log(`File ${filePath} has been successfully removed.`);
        });





    } catch (err) {

        console.error("Error deleting file:", err.message);

    }

};

// Controller to handle video and screenshot upload

const uploadVideoAndScreenshot = async (req, res) => {
    const {

        title, description, videoCode,

        selectedCategory,

    } = req.body;

    const userId = req.userId;

    try {

        // const userName = await User.findOne({ _id: userId });

        const videoUrl = `${req.files.video[0].filename}`;

        const newVideo = new Video({

            title,

            description,

            videoCode,

            selectedCategory: selectedCategory,

            videoUrl,

            posterId: userId,

            likes: 0,

            views: 0

        });



        await newVideo.save();



        // userName.uploads += 1;

        // await userName.save();



        res.status(200).json({ message: 'ビデオが正常にアップロードされました!', videoUrl });

    } catch (error) {

        console.error('Error uploading files:', error);

        res.status(500).json({ message: 'An error occurred during the upload process.' });

    }

};



const getVideos = async (req, res) => {

    console.log("getVideos controller")

    const { page, perPage, sort } = req.body;

    try {

        const skip = (page - 1) * perPage;

        const videos = await Video.find().sort({ [sort]: -1 }).skip(skip).limit(perPage);

        const totalVideos = await Video.countDocuments();



        res.status(200).json({

            videos,

            currentPage: page,

            totalPages: Math.ceil(totalVideos / perPage)

        });

    } catch {

        res.status(500).json({ message: 'An error occurred during the upload process.' });

    }

}

const getPosterVideos = async (req, res) => {

    const { page = 1, perPage = 10, sort = 'uploadDate' } = req.body;

    const userId = req.userId;

    const skip = (page - 1) * perPage;



    try {

        // Run all queries concurrently to reduce execution time

        const [videos, totalVideos, unPaidVideos, paidVideos] = await Promise.all([

            // Fetch videos with pagination, sorting, and lean

            Video.find({ posterId: userId })

                .select('_id title videoDuration views revenue status')

                .sort({ [sort]: -1 })

                .skip(skip)

                .limit(perPage)

                .lean(),



            // Get total count of videos uploaded by the user

            Video.countDocuments({ posterId: userId }),



            // Count unpaid videos

            Video.countDocuments({ posterId: userId, status: "未払い" }),



            // Count paid videos

            Video.countDocuments({ posterId: userId, status: "支払い" })

        ]);



        // Calculate total paid amounts

        const totalPaidMounts = paidVideos * 1000 / 10000;



        // Respond with the data

        res.status(200).json({

            videos: videos,  // The list of videos

            currentPage: page,

            totalPages: Math.ceil(totalVideos / perPage),  // Calculate total pages for pagination

            unPaidVideos: unPaidVideos,  // Unpaid videos count

            paidVideos: paidVideos,    // Paid videos count

            totalPaidMounts: totalPaidMounts // Total paid amount in the specified unit

        });



    } catch (error) {

        console.error("Error in getPosterVideos:", error);

        res.status(500).json({ message: 'An error occurred while fetching the videos.' });

    }

};



const isStaredVideo = async (req, res) => {

    // console.log("getPosterVideos controller")

    const { videoId } = req.body;

    const userId = req.userId;

    try {

        const user = await User.findById(userId);

        user.likes.push(videoId);

        await user.save();

        res.json({ message: "成功！" })

    } catch {

        res.status(500).json({ message: 'An error occurred during the upload process.' });

    }

}



const searchVideos = async (req, res) => {

    const { selectedCategories, selectedSubCategories, currentPage = 1, selectedKeys } = req.body;

    const perPage = 20;

    const skip = (currentPage - 1) * perPage;

    const sort = selectedKeys?.currentKey || 'uploadDate';




    try {

        let query = {};



        // Build query based on selected categories and subcategories

        if (selectedSubCategories.length > 0) {

            // Filter by selectedSubCategories using the $in operator

            query.selectedSubCategory = { $in: selectedSubCategories };

        } else if (selectedCategories.length > 0 && selectedSubCategories.length === 0) {

            // Filter by selectedCategories using the $in operator

            query.selectedCategory = { $in: selectedCategories };

        }



        // console.log("Generated query:", query);



        // Fetch total count of matching documents

        const totalVideos = await Video.countDocuments(query);



        // Fetch paginated, sorted videos based on the query

        let videos = await Video.find(query)

            .sort({ [sort]: -1 })      // Sort by the selected key, default is 'uploadDate'

            .skip(skip)                // Skip documents for pagination

            .limit(perPage);           // Limit the result to `perPage`


        // Respond with videos and total pages info

        res.status(200).json({

            video: videos,                         // The video results

            totalPages: Math.ceil(totalVideos / perPage), // Total pages for pagination

        });

    } catch (error) {

        console.error("Error in searchVideos: ", error);

        res.status(500).json({ message: 'An error occurred during the search process.' });

    }

};



const searchVideoInString = async (req, res) => {

    // console.log("searchVideoInString controller");



    const { inputValue, currentPage, perPage, selectedKeys } = req.body;

    const skip = (currentPage - 1) * perPage;

    const sort = selectedKeys?.currentKey || 'uploadDate';



    try {

        // Use regex for case-insensitive search and optimize query with lean and selected fields

        const query = {

            searchField: new RegExp(inputValue, 'i'), // Precompiled regex for better performance

        };



        // Create a projection to only fetch necessary fields

        const projection = 'title description thumbnailsUrl videoUrl posterName uploadDate views stars';



        // Fetch the total count of matching documents

        const totalVideos = await Video.countDocuments(query);



        // Fetch the paginated and sorted videos

        const videos = await Video.find(query)

            .select(projection)       // Only select required fields

            .sort({ [sort]: -1 })     // Sort by the selected key

            .skip(skip)               // Skip documents for pagination

            .limit(perPage)           // Limit to `perPage`

            .lean();                  // Use lean for better performance



        // Send the response with videos and total pages for pagination

        res.status(200).json({

            video: videos,                            // Array of video results

            totalPages: Math.ceil(totalVideos / perPage),  // Total pages for pagination

        });

    } catch (error) {

        console.error("Error in searchVideoInString:", error);

        res.status(500).json({ message: 'An error occurred during the search process.' });

    }

};






const deleteVideoById = async (req, res) => {

    const { videoId } = req.body;

    try {

        const video = await Video.findById(videoId);

        const videoUrl = await video.videoUrl;
        const deleteVideo = await deleteFileFromLocal(`${videoUrl}`)
        const result = await Video.findOneAndDelete({ _id: videoId })

        res.json({

            message: "成功！"

        })

    } catch (error) {

        // console.log(error)

        res.status(500).json({ message: 'An error occurred during the upload process.' });

    }

}

module.exports = {

    uploadVideoAndScreenshot,

    getVideos,

    searchVideos,

    getPosterVideos,

    isStaredVideo,


    deleteVideoById,

    searchVideoInString

};