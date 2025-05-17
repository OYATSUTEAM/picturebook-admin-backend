require('dotenv').config();

const express = require('express');

const cors = require('cors')

const connectDB = require('./config/db');

// const authRoutes = require('./routes/authRoutes');

// const userRoutes = require('./routes/userRoutes.js');
const authRouters = require('./routes/authRoutes.js');
const userRouters = require('./routes/userRoutes.js');
const fileRouters = require('./routes/fileRouter.js');
const mobileRouter = require('./routes/authRoutes.js');
const productRouters = require ('./routes/productRoutes.js')

const path = require('path');
const { pdfFilter } = require('./controllers/fileController.js');
const app = express();

// MongoDB connection

connectDB();

// Middleware

app.use(cors());

app.use(express.json()); 

app.use(express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    console.log(path.join(__dirname))
})
app.use('/v1/initialize',  authRouters);
app.use('/api/auth',  authRouters);
app.use('/api/user',  userRouters);
app.use('/api/file',  fileRouters);
app.use('/api/product', productRouters);
// app.use('/api/data', mobileRouter);


app.get('/api/data', (req, res) => {
    res.json({
        succcess: true
    })
})
// app.use('/api/payment', paymentRroutes);

// Start server

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

