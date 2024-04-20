const express = require("express");
const router = express.Router();
const { query } = require("../db");
const authenticateToken = require("../middleware/authenticate");

router.get("/:bookingId", authenticateToken, async (req, res) => {
    const bookingId = req.params.bookingId;
    const userId = req.user.userId;
    const result = await query(
      "SELECT b.id, t.name, t.source, t.destination, b.seats_booked FROM bookings b JOIN trains t ON b.train_id = t.id WHERE b.id = ? AND b.user_id = ?",
      [bookingId, userId]
    );
    if (result.length === 0) {
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
      seatsBooked: booking.seats_booked,
    });
  });

  module.exports=router;