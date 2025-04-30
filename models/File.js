const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true }, // 'pdf' or 'audio'
    folderName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update modifiedAt
fileSchema.pre('save', function(next) {
    this.modifiedAt = new Date();
    next();
});

const File = mongoose.model('File', fileSchema);

module.exports = File; 