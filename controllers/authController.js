const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const { generateToken } = require('../utils/jwt');

const Chat = require('../models/Chat');
const nodemailer = require('nodemailer');


require('dotenv').config();


exports.initialize = async (req, res) => {
  console.log('initial request is here')

  const email = process.env.ADMINEMAIL

  const name = process.env.ADMINNAME

  const password = process.env.ADMINPASSWORD

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.findOneAndDelete({ email: email });
  const user = new User({ name, email, password: hashedPassword, decryptedPassword: password, role: 'admin' });

  await user.save();

  const token = generateToken(user._id);

  res.status(201).json(

    {

      message: '正常にサインアップしました。',

      // user: {
      //   userid: user._id,

      //   token: token,

      //   name: name,

      //   email: email,

      //   role: user.role,

      //   status: user.status,

      // },

      unread: 0,

    }

  );
}


exports.register = async (req, res) => {

  console.log('register request is here')

  const { name, email, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {

    return res.status(400).json({ message: 'パスワードが一致しません。' });

  }

  const userExists = await User.findOne({ email });

  if (userExists) {

    return res.status(400).json({ message: 'メールアドレスはすでに存在します。' });

  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashedPassword, decryptedPassword: password });

  await user.save();

  const token = generateToken(user._id);

  res.status(201).json(

    {

      message: '正常にサインアップしました。',

      user: {
        id: user._id,

        token: token,

        name: name,

        email: email,

        role: user.role,

        status: user.status,

      },

      unread: 0,

    }

  );

};



exports.login = async (req, res) => {

  console.log(req.body, 'this is login request')

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

  const token = generateToken(user._id);

  res.status(200).json(

    {

      message: 'サインインに成功しました。',

      accessToken: token,

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        status: user.status,

      },

      unread: unread

    }

  );

};



exports.isMe = async (req, res) => {
  try {
    // Get token from Authorization header


    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '認証トークンが必要です。' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'ユーザーが見つかりません。' });
    }

    let unread = false;

    res.status(200).json({
      message: '認証成功',
      user: {
        IdleDeadline: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        purchased: user.purchased,
      },
      unread: unread
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: '無効なトークンです。' });
  }
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


