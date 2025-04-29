const express = require('express');

const {

    productList,
    productDetail

    // } = require('../controllers/productController');
} = require('../controllers/productController');


const router = express.Router();


router.post('/list', productList);
router.post('/details', productDetail);

module.exports = router;