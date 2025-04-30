const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { pdfAndAudioUpload, pdfFileName } = require('../controllers/fileController')
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Always upload to temp folder first
    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Properly handle Unicode filenames
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const safeName = decodeURIComponent(originalName);
    cb(null, safeName);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.any(), pdfAndAudioUpload);
router.post('/filename', pdfFileName);


module.exports = router;