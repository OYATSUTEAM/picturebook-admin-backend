const mongoose = require('mongoose');

const User = require('./User');

const productSchema = new mongoose.Schema({
    id: { type: String, },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    audioFiles: [{
        name: { type: String, required: true },
        size: { type: Number, required: true },
        url: { type: String, required: true }
    }],
    pdfFile: {
        name: { type: String, required: true },
        size: { type: Number, required: true },
        url: { type: String, required: true }
    },
    published: { type: String, required: true },
    shared: [],
    modifiedAt: { type: Date, default: Date.now() },
    type: { type: String, required: true },
    size: { type: Number, required: true },

});

// Pre-save middleware to set id to _id
productSchema.pre('save', function (next) {
    if (!this.id) {
        console.log(this._id)
        this.id = this._id.toString();
    }
    next();
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