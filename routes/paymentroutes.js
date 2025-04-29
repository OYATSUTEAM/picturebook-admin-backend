const express = require('express');
const router = express.Router();
const {stripePayments} = require('../controllers/paymentController')

router.post('/create-checkout-session', stripePayments);

module.exports = router;