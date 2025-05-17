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

const isExistPdfFileName = async (req, res) => {
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
        const audioFiles = [];
        let totalAudioFileSizes = 0;
        let animationName;
        let animationSize;
        let pdfFileName;
        let pdfFileSize;

        // Base URL for files
        const baseUrl = `${req.protocol}://${req.get('host')}/${folderName}/`;

        for (const file of files) {
            const tempPath = path.join(tempDir, file.filename);
            const finalPath = path.join(finalDir, file.filename);

            fs.renameSync(tempPath, finalPath);

            file.path = finalPath;
            if (file.fieldname === 'animation') {
                animationName = file.filename;
                animationSize = file.size / 1024 / 1024;
            }
            else if (file.fieldname === 'pdf') {
                pdfFileName = file.filename;
                pdfFileSize = file.size / 1024 / 1024;
            } else if (file.fieldname.startsWith('audio_')) {
                let audioFileSize = file.size / 1024 / 1024;
                totalAudioFileSizes += audioFileSize;
                audioFiles.push({
                    name: file.filename,
                    size: parseFloat(audioFileSize.toFixed(2)),
                    url: `${baseUrl}${file.filename}`
                });
            }
        }
        const product = new Product({
            name: folderName,
            description: description,
            price: price,
            animationThumbUrl: 'price',
            animationFile: {
                name: animationName,
                size: parseFloat(animationSize.toFixed(2)),
                url: `${baseUrl}${animationName}`
            },
            pdfFile: {
                name: pdfFileName,
                size: parseFloat(pdfFileSize.toFixed(2)),
                url: `${baseUrl}${pdfFileName}`
            },
            audioFiles: audioFiles,
            publish: 'published',
            purchased: [],
            size: parseFloat((pdfFileSize + totalAudioFileSizes).toFixed(2))
        });

        await product.save();

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
const pdfAndAudioUpdate = async (req, res) => {
    try {
        const productId = req.body.id;
        const description = req.body.description;
        const price = req.body.price;
        const folderName = req.body.name;
        const publish = req.body.publish;

        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Path to the product's directory
        const productDir = path.join(__dirname, '..', 'uploads', existingProduct.name);

        // Delete the product directory and all its contents
        if (fs.existsSync(productDir)) {
            // Delete all files in the directory
            const files = fs.readdirSync(productDir);
            for (const file of files) {
                const filePath = path.join(productDir, file);
                fs.unlinkSync(filePath);
            }

            // Delete the directory itself
            fs.rmdirSync(productDir);
        }

        const sData = {
            name: folderName,
            description: description,
            publish: publish,
            price: price,
        }

        if (!productId) {
            throw new Error('Product ID is required');
        }

        const finalDir = path.join(__dirname, '..', 'uploads', folderName);
        if (!fs.existsSync(finalDir)) {
            fs.mkdirSync(finalDir, { recursive: true });
        }
        const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
        const files = req.files || [];
        const audioFiles = [];
        let totalAudioFileSizes = 0;
        let pdfFileSize = 0;
        let pdfFileName;
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
                let audioFileSize = file.size / 1024 / 1024;
                totalAudioFileSizes += audioFileSize;
                audioFiles.push({
                    name: file.filename,
                    size: parseFloat(audioFileSize.toFixed(2)),
                    url: `${baseUrl}${file.filename}`
                });
            }
        }

        if (pdfFileName) {
            sData.pdfFile = {
                name: pdfFileName,
                size: parseFloat(pdfFileSize.toFixed(2)),
                url: `${baseUrl}${pdfFileName}`
            };
        }
        if (totalAudioFileSizes) {
            sData.audioFiles = audioFiles;
        }

        if (pdfFileSize + totalAudioFileSizes) {
            sData.size = parseFloat((pdfFileSize + totalAudioFileSizes).toFixed(2));
        }

        const updateResult = await Product.findByIdAndUpdate(productId, sData, { new: true });

        if (!updateResult) {
            throw new Error('Product not found');
        }

        res.json({
            message: 'Files updated successfully!',
            product: updateResult
        });

    } catch (err) {
        console.log(err);
        // Clean up temp files if there's an error
        const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
        if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir);
            for (const file of files) {
                fs.unlinkSync(path.join(tempDir, file));
            }
        }
        res.status(500).json({ message: err.message });
    }
};

const deleteExisitingFolder = async (req, res) => {
    try {
        const productId = req.body.id;

        // Find the existing product to get its name
        const existingProduct = await Product.findByIdAndDelete(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Path to the product's directory
        const productDir = path.join(__dirname, '..', 'uploads', existingProduct.name);

        // Delete the product directory and all its contents
        if (fs.existsSync(productDir)) {
            // Delete all files in the directory
            const files = fs.readdirSync(productDir);
            for (const file of files) {
                const filePath = path.join(productDir, file);
                fs.unlinkSync(filePath);
            }

            // Delete the directory itself
            fs.rmdirSync(productDir);
        }

        // Also clean up the temp directory
        const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
        if (fs.existsSync(tempDir)) {
            const tempFiles = fs.readdirSync(tempDir);
            for (const file of tempFiles) {
                const filePath = path.join(tempDir, file);
                fs.unlinkSync(filePath);
            }
        }

        res.json({ message: 'Files and directory deleted successfully' });
    } catch (error) {
        console.error('Error deleting files:', error);
        res.status(500).json({ message: 'Error deleting files' });
    }
};

module.exports = {
    pdfAndAudioUpload,
    pdfAndAudioUpdate,
    isExistPdfFileName,
    deleteExisitingFolder
};
