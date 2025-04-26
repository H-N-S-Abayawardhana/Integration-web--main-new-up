import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gamage_recruiters_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Get a Promise wrapper for the pool
const db = pool.promise();

// Test the connection with a query
const testConnection = async () => {
  try {
    const [result] = await db.query('SELECT 1');
    console.log("✅ Connected to MySQL Database:", result);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);  // Exit the process if the database connection fails
  }
};

// Test the connection when the module is loaded
testConnection();

// Handle unexpected errors
pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('⚠️ Database connection was closed.');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('⚠️ Database has too many connections.');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('⚠️ Database connection was refused.');
  } else {
    console.error('⚠️ Unknown error:', err);
  }
});

export default db;
