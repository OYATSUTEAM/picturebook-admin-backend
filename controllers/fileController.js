const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const serviceAccount = require('../firebase-service-account.json');
const admin = require('firebase-admin');
const User = require('../models/User');
const Product = require('../models/Product');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const pdfFileName = async (req, res) => {
    try {
        const folderName = req.body.name;
        const file = await Product.findOne({ name: folderName });
        if (file == null) {
            res.json({
                message: 'ok'
            })
        }
        else {
            console.log('error')
            res.status(500).json({ message: 'Folder name is exist' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
}
// Middleware to handle file uploads
const pdfAndAudioUpload = async (req, res) => {
    try {
        const firestore = admin.firestore();
        const folderName = req.body.name;
        const description = req.body.description;
        if (!folderName) {
            throw new Error('Folder name is required');
        }

        const finalDir = path.join(__dirname, '..', 'uploads', folderName);
        if (!fs.existsSync(finalDir)) {
            fs.mkdirSync(finalDir, { recursive: true });
        }
        const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
        const files = req.files || [];
        let pdfFileName = '';
        const audioFileNames = [];
        for (const file of files) {
            const tempPath = path.join(tempDir, file.filename);
            const finalPath = path.join(finalDir, file.filename);

            fs.renameSync(tempPath, finalPath);

            file.path = finalPath;

            if (file.fieldname === 'pdf') {
                pdfFileName = file.filename;  // Store only the filename
            } else if (file.fieldname.startsWith('audio_')) {
                audioFileNames.push(file.filename);  // Store only the filename
            }
        }

        const pdfFilePath = path.join('uploads', folderName, pdfFileName);
        const audioFilePaths = audioFileNames.map(audio => path.join('uploads', folderName, audio));
        const docData = {
            pdf: pdfFilePath,
            audios: audioFilePaths,
            uploadedAt: new Date()
        };
        // await firestore.collection('uploads').doc(folderName).set(docData);
        const product = new Product({
            name: folderName,
            description: description,
            pdfFileName: pdfFileName,
            audioFileNames: audioFileNames
        });
        
        res.json({
            message: 'Files uploaded successfully!',
            pdfFileName: pdfFileName,
            audioFileNames: audioFileNames,
            files: files
        });
        
        product.save();
    } catch (err) {
        console.log(err)
        // Clean up temp files if there's an error
        const tempDir = path.join(__dirname, '..', 'Uploads', 'temp');
        if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir);
            for (const file of files) {
                fs.unlinkSync(path.join(tempDir, file));
            }
        }
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    pdfAndAudioUpload,
    pdfFileName
};
