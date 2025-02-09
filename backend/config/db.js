const mysql = require("mysql2");

// Load environment variables from .env (if running locally)
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,       // Use Render-provided host
    user: process.env.DB_USER,       // MySQL username
    password: process.env.DB_PASSWORD, // MySQL password
    database: process.env.DB_NAME,   // Database name
    port: process.env.DB_PORT || 3306, // MySQL default port
    ssl: {
        rejectUnauthorized: true, // Use secure connection for cloud databases
    },
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL Database");
    }
});

module.exports = db;
