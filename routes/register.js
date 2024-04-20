const express = require("express");
const router = express.Router();
const { query } = require("../db");
const bcrypt = require("bcrypt");

router.post("", async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultRole = "user";
    try {
      const result = await query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role || defaultRole]
      );
  
      res.status(200).json({
        status: "Account successfully created",
        status_code: 200,
        user_id: result.insertId,
      });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Email already registered" });
      }
    }
  });
  
module.exports = router;