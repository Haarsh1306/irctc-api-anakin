const express = require("express");
const router = express.Router();
const { query } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("", async (req, res) => {
    const { email, password } = req.body;
  
    const results = await query("SELECT * FROM users WHERE email = ?", [email]);
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
      { email: user.email, role: user.role, userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    if (results[0].role === "admin") {
      res.status(200).json({
        status: "Login successful",
        status_code: 200,
        user_id: user.id,
        access_token: accessToken,
        api_key: process.env.API_KEY,
      });
    } else
      res.status(200).json({
        status: "Login successful",
        status_code: 200,
        user_id: user.id,
        access_token: accessToken,
      });
  });

module.exports=router