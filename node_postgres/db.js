const Pool = require('pg').Pool
const pool = new Pool({
    user: "postgres",
    password: "3298140",
    host: "localhost",
    port: 5432,
    database: "diploma_db"
})


module.exports = pool