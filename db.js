const Pool = require('pg').Pool
const pool = new Pool({
  user: "ArtyomSF99",
  password: "V4shomPYdX6S",
  database: "work-counter",
  port: 5432,
  host: "ep-old-grass-141326.us-east-2.aws.neon.tech",
  ssl: { rejectUnauthorized: false }
})


module.exports = pool