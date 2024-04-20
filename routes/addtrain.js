const express = require("express");
const router = express.Router();
const { query } = require("../db");
const authenticateToken = require("../middleware/authenticate");
const authenticateAdminApiKey = require("../middleware/authenticateAdminApiKey");

router.post(
    "",
    authenticateToken,
    authenticateAdminApiKey,
    async (req, res) => {
      const { name, source, destination, totalSeats } = req.body;
  
      const result = await query(
        "INSERT INTO trains (name, source, destination, total_seats) VALUES (?, ?, ?, ?)",
        [name, source, destination, totalSeats]
      );
      res.status(200).json({
        status: "Train added successfully",
        status_code: 200,
      });
    }
  );

module.exports=router