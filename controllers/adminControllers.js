const News = require('../models/News');

const Video = require('../models/Video');

const Chat = require('../models/Chat');

const User = require('../models/User');



const createNews = async (req, res) => {

    const { title, content } = req.body

    try {

        const news = new News({

            title: title,

            content: content

        })

        await news.save()

        res.json({

            message: 'ニュースが正常に作成されました。',

        })

    } catch (err) {

        res.status(500).json({ message: err.message })

    }

}





const getNews = async (req, res) => {

    const perPage = 4

    const page = req.body.currenPage

    const skip = (page - 1) * perPage

    try {

        const news = await News.find().sort({ date: -1 }).skip(skip).limit(perPage)

        const totalPages = Math.ceil(await News.countDocuments() / perPage)

        res.json({

            news,

            totalPages

        })

    } catch (err) {

        res.status(500).json({ message: err.message })

    }

}



const getAnalyseData = async (req, res) => {

    try {

        const viewerNumber = await User.countDocuments({ role: "有料会員" });

        const postersNumber = await User.countDocuments({ posterCounts: { $gt: 0 } });

        const videoNumber = await Video.countDocuments();

        const paid = 4000000;



        res.json({

            viewer: viewerNumber,

            posters: postersNumber,

            video: videoNumber,

            paidCount: paid

        })

    } catch (err) {

        res.status(500).json({ message: err.message })

    }

}



const getAllVideos = async (req, res) => {

    console.log('get all videos');

    const { page, perPage, sort } = req.body;

    try {

        const skip = (page - 1) * perPage;

        const videos = await Video.find().populate('posterId').sort({ [sort]: 1 }).skip(skip).limit(perPage);

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



const getVideoDetail = async (req, res) => {

    const { videoId } = req.body;

    try {

        const video = await Video.findById(videoId)

        res.json({

            video

        })

    } catch (error) {

        res.status(500).json({ message: 'An error occurred during the upload process.' });

    }

}



const updateVideo = async (req, res) => {

    const { id, selectedCategory, selectedSubCategory, status } = req.body;

    try {

        const video = await Video.findById(id)

        video.selectedCategory = selectedCategory

        video.selectedSubCategory = selectedSubCategory

        video.status = status

        await video.save()

        res.json({

            video

        })

    } catch (error) {

        res.status(500).json({ message: 'An error occurred during the upload process.' });

    }

}



const getAllMessage = async (req, res) => {

    try {

        const chats = await Chat.find()

        res.json({

            messages: chats

        })

    } catch (error) {

        res.status(500).json({ message: 'An error occurred during the upload process.' });

    }

}

const sendMessages = async (req, res) => {

    const { userId, content } = req.body;

    try {

        const chat = await Chat.findOne({ userId: userId })

        chat.messages.push({

            from: "admin",

            content: content

        })

        chat.new = true;

        await chat.save()

        res.json({

            message: "送信が完了しました！"

        })

    } catch (error) {

        res.status(500).json({ message: 'An error occurred during the upload process.' });

    }

}


const deleteUserById = async (req, res) => {

    console.log("deleteUserById")

    const { userId } = req.body;

    try {


        const result = await User.findOneAndDelete({ _id: userId })

        res.json({

            message: "成功！"

        })

    } catch (error) {

        console.log(error)

        res.status(500).json({ message: 'An error occurred during the upload process.' });

    }

}

const viewMessages = async (req, res) => {

    const { userId } = req.body;

    try {

        const chat = await Chat.findOne({ userId: userId });

        chat.unread = 0;

        await chat.save();

        res.json({

            message: "メッセージを読みました。"

        })



    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};



const deleteAllChats = async (req, res) => {

    const { userId } = req.body;



    try {

        const result = await Chat.deleteOne({ userId: userId }); // Perform the deletion



        if (result.deletedCount === 0) {

            // No chat was found for this userId

            return res.status(404).json({ message: "No chat found for this user." });

        }



        res.json({

            message: "すべてのメッセージを削除しました。"

        });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};

const searchUsersInString = async (req, res) => {

    const { inputValue, page, perPage } = req.body;

    const skip = (page - 1) * perPage;



    try {

        const query = {

            searchField: new RegExp(inputValue, 'i'), // Precompiled regex for better performance

        };

        const projection = 'name email role videoUrl avatar posterCounts viewCounts expired';

        const totalVideos = await User.countDocuments(query);

        const users = await User.find(query)

            .select(projection)

            .skip(skip)

            .limit(perPage)

            .lean();



        // Send the response with videos and total pages for pagination

        res.status(200).json({

            users: users,

            totalPages: Math.ceil(totalVideos / perPage),

        });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};

const blockThisUser = async (req, res) => {

    const { id } = req.body;
    console.log('block this user', id)
  
    try {
  
      const user = await User.findById({_id:id  });
  
      if (!user) {
  
        return res.status(400).json({ message: 'ユーザーが見つかりません。' });
  
      }
  
      if(user.role === 'admin'){

        return res.status(400).json({ message: 'このユーザーは管理者です。' });

      }
      user.status = 'blocked'

      await user.save();
  
      res.status(200).json({ message:  `${user.name} はブロックされている。`});
  
    } catch (err) {
  
      console.log(err);
  
      res.status(500).json({ message: 'Internal server error' });
  
    }
  
  }
  
  
const unBlockThisUser = async (req, res) => {

    const { id } = req.body;
    console.log('block this user', id)
  
    try {
  
      const user = await User.findById({_id:id  });
  
      if (!user) {
  
        return res.status(400).json({ message: 'ユーザーが見つかりません。' });
  
      }
  
      if(user.role === 'admin'){

        return res.status(400).json({ message: 'このユーザーは管理者です。' });

      }
      user.status = 'permitted'

      await user.save();
  
      res.status(200).json({ message:  `${user.name} はブロックされている。`});
  
    } catch (err) {
  
      console.log(err);
  
      res.status(500).json({ message: 'Internal server error' });
  
    }
  
  }
  



module.exports = {

    createNews,

    getNews,

    getVideoDetail,

    blockThisUser,

    unBlockThisUser,
    
    getAllVideos,

    updateVideo,

    getAllMessage,

    sendMessages,

    viewMessages,

    deleteAllChats,

    getAnalyseData,

    searchUsersInString,

    deleteUserById
}