const User = require('../models/User');




const uploadFileToS3 = async (fileBuffer, fileName, contentType) => {

    const params = {

        Bucket: process.env.AWS_BUCKET_NAME,

        Key: fileName,

        Body: fileBuffer,

        ACL: 'public-read',  // Public access for the file

        ContentType: contentType,

    };

    const command = new PutObjectCommand(params);

    console.log(command);

    return s3Client.send(command);

};



const updateProfile = async (req, res) => {



    const { name, email } = req.body;

    const userId = req.userId;

    console.log(name, email, userId);

    try {

        const user = await User.findById(userId);


        if (!user) {

            return res.status(404).json({ message: 'ユーザーが見つかりません。' });

        }



        const avatar = req.files['avatar'][0];



        const avatarName = `avatars/${uuidv4()}${path.extname(avatar.originalname)}`;

        const avatarS3Response = await uploadFileToS3(avatar.buffer, avatarName, avatar.mimetype);

        const avatarUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${avatarName}`;

        console.log('Avatar uploaded to S3:', avatarS3Response);



        user.name = name;

        user.email = email;

        user.avatar = avatarUrl;

        await user.save();

        res.status(200).json(

            {

                message: 'プロフィールが正常に更新されました。',

                user: {

                    name: user.name,

                    email: user.email,

                    avatar: user.avatar

                }

            }

        );

    } catch (err) {

        res.status(500).json({ message: 'Internal server error' });

    }

}



module.exports = {

    updateProfile

}