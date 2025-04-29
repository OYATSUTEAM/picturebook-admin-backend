const bcrypt = require('bcrypt');

const User = require('../models/User');

const { generateToken } = require('../utils/jwt');

const Chat = require('../models/Chat');
const nodemailer = require('nodemailer');


exports.register = async (req, res) => {
  console.log('mobile request is here')
  // const { name, email, password, confirmPassword } = req.body;

  // if (password !== confirmPassword) {

  //   return res.status(400).json({ message: 'パスワードが一致しません。' });

  // }

  // const userExists = await User.findOne({ email });

  // if (userExists) {

  //   return res.status(400).json({ message: 'メールアドレスはすでに存在します。' });

  // }

  // const hashedPassword = await bcrypt.hash(password, 10);

  // const user = new User({ name, email, password: hashedPassword, decryptedPassword: password });

  // await user.save();

  // const token = generateToken(user._id);

  res.status(201).json(

    {

      //   message: '正常にサインアップしました。',

      //   user: {
      //     userid: user._id,

      //     token: token,

      //     name: name,

      //     email: email,

      //     avatar: user.avatar,

      //     role: user.role,

      //     status: user.status,

      //   },

      //   unread: 0,

    }

  );

};



exports.login = async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  let unread = false;

  if (!user) {

    return res.status(400).json({ message: '認証情報が無効か、メールが確認されていません。' });

  }



  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {

    return res.status(400).json({ message: '無効な資格情報。' });

  }



  const chat = await Chat.findOne({ userId: user._id });

  if (chat) {

    unread = chat?.new;

  }



  const token = generateToken(user._id);

  res.status(200).json(

    {

      message: 'サインインに成功しました。',

      user: {
        userid: user._id,

        token: token,

        name: user.name,

        email: user.email,

        avatar: user.avatar,

        role: user.role,

        status: user.status,

      },

      unread: unread

    }

  );

};



exports.forgotPassword = async (req, res) => {

  const { email } = req.body;
  console.log('forgot password', email)


  try {

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(400).json({ message: 'ユーザーが見つかりません。' });

    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpier = new Date();

    otpExpier.setMinutes(otpExpier.getMinutes() + 1);

    user.verificationCode = verificationCode;


    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'it.engineer0707@gmail.com',
        pass: '6938944301027zzz'
      }
    });

    const mailOptions = {
      from: 'it.engineer0707@gmail.com',
      to: 'hiroshitanaka9527@gmail.com',
      subject: 'Password reset OTP',
      text: `Your OTP (It is expired after 1 min) : ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error, 'errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
        //  res.status(500).json({data:error})
      } else {
        console.log(info, 'inffffffffffffffffffffffff')
        // res.json({
        // data: "Your OTP send to the email"
        // })
      }
    });

    await user.save();

    // sendVerificationEmail(email, verificationCode);

    res.status(200).json({ message: 'Verification email sent' });

  } catch (err) {

    console.log(err);

    res.status(500).json({ message: 'Internal server error' });

  }

}


