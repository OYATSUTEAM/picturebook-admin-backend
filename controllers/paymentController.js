const Stripe = require('stripe');

const User = require("../models/User");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);



const stripePayments = async (req, res) => {

    console.log("payments intergration", process.env.STRIPE_SECRET_KEY)

    const userId = req.userId;

    try {

        const session = await stripe.checkout.sessions.create({

            payment_method_types: ['card'],

            line_items: [

                {

                    price_data: {

                        currency: 'jpy',

                        product_data: {

                            name: 'Subscription Plan',

                        },

                        unit_amount: 800000,

                    },

                    quantity: 1,

                },

            ],

            mode: 'payment',

            success_url: `${process.env.CLIENT_URL}/account`,

            cancel_url: `${process.env.CLIENT_URL}/account`,

        });

        const user = await User.findById(userId);

        user.role = "有料会員";



        // Set the start time to either the previous expiration end or the current time (if no expiration exists)

        user.expired.start = expired?.end ? expired.end : Date.now();



        // Add 365 days (1 year) to either the existing expiration end or the current time if no previous expiration

        user.expired.end = (expired?.end ? expired.end : Date.now()) + (365 * 24 * 60 * 60 * 1000);



        user.save();



        res.json({ id: session.id });

    } catch (err) {

        res.status(500).json({ error: err.message });

    }



};



module.exports = { stripePayments };