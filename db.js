const Pool = require("pg").Pool;
// require("dotenv").config();

const pool = new Pool({
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  host: process.env.HOST,
  port: process.env.PORT,
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
module.exports = pool;
