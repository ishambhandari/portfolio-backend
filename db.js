const Pool = require("pg").Pool;
// require("dotenv").config();

const pool = new Pool(process.env.DATABASE_URL, {
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  host: process.env.HOST,
  port: process.env.PORT,
});
module.exports = pool;
