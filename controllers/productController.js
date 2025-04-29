const Chat = require('../models/Chat');

const User = require('../models/User');
const Video = require('../models/Video');
const Product = require('../models/Product');





const productList = async (req, res) => {

    try {
        const product = await Product.find({});
        console.log(product)

        res.json({
            products: product
        })

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};
const productDetail = async (req, res) => {
    try {
        const productId = req.body.params.productId;
        const productDetail = await Product.findById(productId);
        console.log(productDetail)
        if (productDetail != null) {
            res.json({
                data: productDetail,
                message: 'success'
            })
        }
    } catch (error) {
res.status(500).json({message:'error'})
    }
}

module.exports = {

    productList,
    productDetail


};