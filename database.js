require('dotenv').config(); // Load environment variables from .env file
const mysql = require('mysql2');

// Create a new pool instance
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the pool so it can be used in other modules
module.exports = pool.promise();
