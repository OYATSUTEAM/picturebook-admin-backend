const multer = require('multer');



// Use memory storage to access files directly

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./public/`); // Files will be saved in the 'uploads' directory
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + req.body.title + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024 * 1024,
  },
});

module.exports = upload;

