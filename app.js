require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

// User registration
app.use('/register', require('./routes/register'));

//User login
app.use('/login', require('./routes/login'));

// Add a train
app.use('/addtrain', require('./routes/addtrain'));

// Get all trains
app.use('/trains', require('./routes/trains'));

// Booking train
app.use('/book', require('./routes/book'));

// Get specific booking details
app.use('/bookings', require('./routes/bookings'));

app.listen(3000);
