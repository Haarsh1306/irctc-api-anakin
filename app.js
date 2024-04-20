require("dotenv").config();
const express = require("express");
const authenticateToken = require("./middleware/authenticate");
const authenticateAdminApiKey = require("./middleware/authenticateAdminApiKey");  
const { query } = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());

//User register
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, role]
  );
  
  res.status(200).json({
    status: "Account successfully created",
    status_code: 200,
    user_id: result.insertId,
  });
});

//User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const results = await query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  const user = results[0];

  if (!user) {
    return res.status(401).json({
      status: "Incorrect username/password provided. Please retry",
      status_code: 401,
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      status: "Incorrect username/password provided. Please retry",
      status_code: 401,
    });
  }

  const accessToken = jwt.sign(
    { username: user.username, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  if(results[0].role === 'admin'){
    res.status(200).json({
      status: "Login successful",
      status_code: 200,
      user_id: user.id,
      access_token: accessToken,
      api_key: process.env.API_KEY,
  });
  }
  else res.status(200).json({
      status: "Login successful",
      status_code: 200,
      user_id: user.id,
      access_token: accessToken,
    });
});

// Add a train
app.post('/addtrain',authenticateToken, authenticateAdminApiKey, async (req, res) => {
  const { name, source, destination, totalSeats } = req.body;

  const result = await query(
    'INSERT INTO trains (name, source, destination, total_seats) VALUES (?, ?, ?, ?)',
    [name, source, destination, totalSeats]
  );
  res.status(200).json({
    status: "Train added successfully",
    status_code: 200,
  });
});

// Get all trains
app.get('/trains', async (req, res) => {
  const { source, destination } = req.body;

  const result = await query('SELECT * FROM trains WHERE source = ? AND destination = ?',
  [source, destination])
  console.log(result)
  if(result.length === 0){
    return res.status(404).json({
      status: "No trains found",
      status_code: 404,
    });
  }
  const trains = result.map((train) => ({
    id: train.id,
    name: train.name,
    source: train.source,
    destination: train.destination,
    availableSeats: train.total_seats,
  }));

  res.json(trains);

  connection.query(
    'SELECT * FROM trains WHERE source = ? AND destination = ?',
    [source, destination],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching trains');
      }

      const trains = results.map((train) => ({
        id: train.id,
        name: train.name,
        source: train.source,
        destination: train.destination,
        availableSeats: train.total_seats
      }));

      res.json(trains);
    }
  );
});

app.post('/book', authenticateToken, async (req, res) => {
  const {userId, trainId, seats } = req.body;
  const result = await query('SELECT total_seats FROM trains WHERE id = ?',
  [trainId])

  if(result.length === 0){
    return res.status(404).json({
      status: "Train not found",
      status_code: 404,
    });
  }
  const availableSeats = result[0].total_seats;
  if(availableSeats < seats){
    return res.status(400).json({
      status: "Not enough seats available",
      status_code: 400,
    });
  }
  const updateResult = await query(
    'UPDATE trains SET total_seats = total_seats - ? WHERE id = ?',
    [seats, trainId]
  )

  const insertBooking = await query(
    'INSERT INTO bookings (user_id, train_id, seats_booked) VALUES (?, ?, ?)',
    [userId, trainId, seats]
  )

  res.status(200).json({
    status: "Seat booked successfully",
    status_code: 200,
  });

});

// Get specific booking details
app.get('/bookings/:bookingId', authenticateToken, async (req, res) => {
  const bookingId = req.params.bookingId;

  const result = await query(
    'SELECT b.id, t.name, t.source, t.destination, b.seats_booked FROM bookings b JOIN trains t ON b.train_id = t.id WHERE b.id = ?',
    [bookingId]
  );
  if(result.length === 0){
    return res.status(404).json({
      status: "Booking not found",
      status_code: 404,
    });
  }
  const booking = result[0];
  res.json({
    id: booking.id,
    trainName: booking.name,
    source: booking.source,
    destination: booking.destination,
    seatsBooked: booking.seats_booked
  });
});

app.listen(3000, () => console.log("Server started on port 3000"));
