const mongoose = require('mongoose');

const User = require('./User');
const { pdfFileName } = require('../controllers/fileController');

const productSchema = new mongoose.Schema({

    name: { type: String, required: true },

    description: { type: String, required: true },

    pdfFileName: { type: String, required: true },

    audioFileNames: [

    ]
    // videoUrl: { type: String, required: true },

    // posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // uploadDate: { type: Date, default: Date.now },

    // views: { type: Number, default: 0 },

    // status: { type: String, default: '保留中' },

    // revenue: { type: Number, default: 0 },

    // stars: { type: Number, default: 0 },

    // searchField: { type: String },

    // likedBy: [{

    //     type: mongoose.Schema.Types.ObjectId,

    //     ref: 'User',

    //     default: null

    // }],

});



// Pre-save middleware to dynamically set searchField

productSchema.pre('save', function (next) {

    this.searchField = `${this.title} ${this.description} ${this.machineName} ${this.manufacturer} ${this.selectedCategory} ${this.selectedSubCategory}`;

    next();

});



// Add indexes to frequently queried fields

productSchema.index({ searchField: 'text' });

productSchema.index({ uploadDate: -1 });



// Create the Video model

const Product = mongoose.model('Product', productSchema);



module.exports = Product;