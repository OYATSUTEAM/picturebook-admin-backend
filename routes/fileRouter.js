const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { pdfAndAudioUpload, isExistPdfFileName, pdfAndAudioUpdate, deleteExisitingFolder } = require('../controllers/fileController')
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
    // Generate a random filename with the original extension
    const ext = path.extname(file.originalname);
    const randomName = uuidv4() + ext;
    cb(null, randomName);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.any(), pdfAndAudioUpload);
router.post('/update', upload.any(), pdfAndAudioUpdate);
router.post('/deleteExistingFile', deleteExisitingFolder);
router.post('/filename', isExistPdfFileName);

module.exports = router;