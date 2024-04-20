const express = require("express");
const router = express.Router();
const { query } = require("../db");
const authenticateToken = require("../middleware/authenticate");

router.get("", authenticateToken, async(req, res) => {
    const { source, destination } = req.body;
    const result = await query(
      "SELECT * FROM trains WHERE source = ? AND destination = ?",
      [source, destination]
    );
    console.log(result);
    if (result.length === 0) {
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
  });

module.exports = router;