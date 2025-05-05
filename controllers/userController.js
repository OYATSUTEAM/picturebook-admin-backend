const Chat = require('../models/Chat');

const User = require('../models/User');

const getUsers = async (req, res) => {

    const { perPage, page, sort } = req.body;

    console.log(req.body, ' this is get users')

    const skip = (page - 1) * perPage;

    try {

        const users = await User.find().sort({ [sort]: -1 }).skip(skip).limit(perPage);

        totalPages = Math.ceil(await User.countDocuments() / perPage);

        res.json({ users: users, totalPages: totalPages });
console.log(users)

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};


const sendAskMessage = async (req, res) => {

    console.log("sendAskMessage")

    const userId = req.userId;

    const { content } = req.body;

    console.log(content)

    try {

        const user = await User.findOne({ _id: userId });

        if (!user) {

            throw new Error("ユーザーが見つかりません。");

        }



        let chat = await Chat.findOne({ userId: userId });

        console.log(chat)

        if (!chat) {

            // Create a new chat if it doesn't exist

            chat = new Chat({

                userId: userId,

                userName: user.name,

                userAvatar: user.avatar,

                messages: [{

                    from: userId,

                    content: content,

                }],

                unread: 1,  // Initial unread count

            });

        } else {

            // Update existing chat

            chat.messages.push({

                from: userId,

                content: content
            });

            chat.unread += 1;  // Increment unread count

        }



        // Save the chat (either a new one or the updated one)

        await chat.save();



        res.json({ message: "送信に成功しました。" });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};



const getUserMessage = async (req, res) => {

    console.log("getUserMessage")

    const userId = req.userId;

    try {

        let chats = await Chat.findOne({ userId: userId });

        res.json({ chats: chats });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};

const getPermission = async (req, res) => {

    console.log("getUserMessage")

    const email = req.body.email;

    try {

        const user = await User.findOne({ email: email});

        res.json({ permission: user.status });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};

const giveStarToVideo = async (req, res) => {
    console.log(req.body, req.userId, "this is give star to video");

    const userId = req.userId;
    const { videoId } = req.body;

    try {
        const video = await Video.findOne({ _id: videoId });
        const user = await User.findOne({ _id: userId });
        console.log(video, 'this is give star to video')
        if (!video || !user) {
            return res.status(404).json({ message: "Video or User not found" });
        }

        // Check if the user has already liked the video
        const userIndexInVideoLikes = video.likedBy.indexOf(userId);

        if (userIndexInVideoLikes !== -1) {
            // User already liked the video; remove their like
            console.log('this user is existed in list!')
            video.likedBy.splice(userIndexInVideoLikes, 1);
            video.stars -= 1;

            // Remove video from user's likes list
            user.likes = user.likes.filter((id) => id.toString() !== videoId);
        } else {
            // User hasn't liked the video yet; add their like
            video.likedBy.push(userId);
            video.stars += 1;

            // Add video to user's likes list
            user.likes.push(videoId);
        }

        // Save the changes to the database
        await video.save();
        await user.save();

        res.json({
            message: userIndexInVideoLikes !== -1
                ? "You removed your star from the video!"
                : "You gave a star to the video!",
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const readMessage = async (req, res) => {

    console.log("readMessage")

    const userId = req.userId;

    console.log(req.body)

    try {

        const chat = await Chat.findById({ userId: userId });

        chat.new = false;

        await chat.save()

        res.json({

            message: "Read Messsage!"

        })



    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};


const submitReply = async (req, res) => {

    console.log("submitReply Message!")

    // const userId = req.userId;

    console.log(req.body)

    try {

        // const chat = await Chat.findById({ userId: userId });

        // chat.new = false;

        // await chat.save()

        res.json({

            message: "Read Messsage!"

        })



    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};


module.exports = {

    getUsers,

    sendAskMessage,

    getUserMessage,

    giveStarToVideo,

    readMessage,

    submitReply,

    getPermission,



};