/*
This is a simple mock application made for illustration
purpose of Angular Testing. Highly recommended not using
for production as it's not secure nor it does provide the
minimum required functions.
*/
const express = require('express');
const userRoutes = require('./src/routes/users');
const cors = require('cors');

const app = express();


// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/users', userRoutes);
app.use('*', (req, res) => {
    return res.status(404).json({
        success: false,
        message: 'This route is not available',
    });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));