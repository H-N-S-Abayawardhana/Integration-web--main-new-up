import db from './db.js';

async function verifyDatabaseSetup() {
    try {
        // Test database connection
        console.log('Testing database connection...');
        const [result] = await db.execute('SELECT 1');  // Using db.execute instead of query for simplicity in some setups
        console.log('✅ Database connection successful');

        // Check if user table exists and its structure
        console.log('\nChecking user table structure...');
        const [tables] = await db.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user'
        `, [process.env.DB_NAME]);

        if (tables.length === 0) {
            console.log('❌ User table does not exist. Creating table...');
            await db.execute(`
                CREATE TABLE user (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255),
                    otp VARCHAR(6),
                    isAdmin BOOLEAN DEFAULT false,
                    profilePicture VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ User table created successfully');
        } else {
            console.log('✅ User table exists');
            
            // Check table columns
            const [columns] = await db.execute(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user'
            `, [process.env.DB_NAME]);

            console.log('\nCurrent table structure:');
            columns.forEach(col => {
                console.log(`${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : ''} ${col.COLUMN_KEY === 'PRI' ? 'PRIMARY KEY' : ''}`);
            });
        }

        // Check if there are any users in the table
        const [users] = await db.execute('SELECT COUNT(*) AS count FROM user');
        console.log(`\n✅ Total users in database: ${users[0].count}`);

        console.log('\nDatabase verification completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database verification failed:', error);
        process.exit(1);
    }
}

verifyDatabaseSetup();
