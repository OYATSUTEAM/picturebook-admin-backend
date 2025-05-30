const Chat = require('../models/Chat');

const User = require('../models/User');
const Product = require('../models/Product');






const productList = async (req, res) => {
    console.log('product list is called')
    try {
        const products = await Product.find({});

        res.json({
            products: products,
            message: 'success'
        })

    } catch (err) {
        res.status(500).json({ message: err.message });
    }

};
const productDetail = async (req, res) => {
    try {

        const { productId } = req.body;
        console.log(productId)

        const productDetail = await Product.findById(productId);
        if (productDetail != null) {
            res.json({
                product: productDetail,
                message: 'success'
            })
        }
        else {
            res.status(500).json({ message: 'no data' })
        }
    } catch (error) {
        res.status(500).json({ message: 'error' })
    }
}

module.exports = {

    productList,
    productDetail


};