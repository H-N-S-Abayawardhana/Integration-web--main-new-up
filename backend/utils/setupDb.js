import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Fetch environment variables with fallback defaults
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gamage_recruiters_db',  // Use DB_NAME in the configuration
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Function to setup the database
async function setupDatabase() {
    let connection;
    try {
        // Create a connection to MySQL without the database selected
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        console.log('Connected to MySQL server');

        // Create database if it doesn't exist and then use it
        const dbName = process.env.DB_NAME || 'gamage_recruiters_db';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Database ${dbName} created or already exists`);

        // Use the newly created or existing database
        await connection.query(`USE \`${dbName}\``);

        // Create user table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                otp VARCHAR(6),
                isAdmin BOOLEAN DEFAULT FALSE,
                profilePicture VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('User table created or already exists');

        // Create postedjobs table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS postedjobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                job_title VARCHAR(255) NOT NULL,
                state VARCHAR(100) NOT NULL,
                salary DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'LKR',
                location VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Postedjobs table created or already exists');

        // Create applyjob table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS applyjob (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                mobile_number VARCHAR(15) NOT NULL,
                experience_years INT DEFAULT 0,
                cv_resume VARCHAR(255) NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                job_id INT NOT NULL,
                FOREIGN KEY (job_id) REFERENCES postedjobs(id) ON DELETE CASCADE
            )
        `);
        console.log('Applyjob table created or already exists');

        // Create contact_us table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS contact_us (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone_number VARCHAR(15) NOT NULL,
                email VARCHAR(100) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Contact_us table created or already exists');

        // Create mailing table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS mailing (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Mailing table created or already exists');

        // Create default admin user if not exists
        const [adminUsers] = await connection.query('SELECT * FROM user WHERE email = ? AND isAdmin = true', ['admin@gamage.com']);
        
        if (adminUsers.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.query(`
                INSERT INTO user (name, email, password, isAdmin) 
                VALUES (?, ?, ?, true)
            `, ['Admin', 'admin@gamage.com', hashedPassword]);
            console.log('✅ Default admin user created');
        } else {
            console.log('✅ Admin user already exists');
        }

        console.log('✅ Database setup completed successfully');
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();  // Ensure connection is properly closed
        }
    }
}

setupDatabase();
