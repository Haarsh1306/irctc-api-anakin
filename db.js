const util = require("util");
const mysql = require("mysql");
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
});
const query = util.promisify(pool.query).bind(pool);
module.exports = { query };
