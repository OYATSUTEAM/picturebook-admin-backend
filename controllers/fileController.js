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
        const price = req.body.price;
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
        let pdfFileSize = 0;
        const audioFileNames = [];
        const audioFileSizes = [];
        const audioFiles = [];
        let totalAudioFileSizes = 0;

        // Base URL for files
        const baseUrl = `${req.protocol}://${req.get('host')}/${folderName}/`;

        for (const file of files) {
            const tempPath = path.join(tempDir, file.filename);
            const finalPath = path.join(finalDir, file.filename);

            fs.renameSync(tempPath, finalPath);

            file.path = finalPath;

            if (file.fieldname === 'pdf') {
                pdfFileName = file.filename;
                pdfFileSize = file.size / 1024 / 1024;
            } else if (file.fieldname.startsWith('audio_')) {
                audioFileNames.push(file.filename);
                let audioFileSize = file.size / 1024 / 1024;
                audioFileSizes.push(audioFileSize);
                totalAudioFileSizes += audioFileSize;
                audioFiles.push({
                    name: file.filename,
                    size: parseFloat(audioFileSize.toFixed(2)),
                    url: `${baseUrl}${file.filename}`
                });
            }
        }
        const pdfFilePath = path.join('uploads', folderName, pdfFileName);
        const audioFilePaths = audioFileNames.map(audio => path.join('uploads', folderName, audio));
        const docData = {
            pdf: pdfFilePath,
            audios: audioFilePaths,
            uploadedAt: new Date()
        };
        const product = new Product({
            name: folderName,
            description: description,
            price: price,
            pdfFile: {
                name: pdfFileName,
                size: parseFloat(pdfFileSize.toFixed(2)),
                url: `${baseUrl}${pdfFileName}`
            },
            audioFiles: audioFiles,
            publish: 'published',
            shared: [],
            type: 'folder',
            size: parseFloat((pdfFileSize + totalAudioFileSizes).toFixed(2))
        });

        await product.save();

        console.log(product)

        res.json({
            message: 'Files uploaded successfully!',
            product: product
        });
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
