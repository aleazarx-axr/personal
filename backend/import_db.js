require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dumpPath = path.join(__dirname, '..', 'database.sql');

async function importDatabase() {
    if (!fs.existsSync(dumpPath)) {
        console.error('Error: database.sql not found in the root directory.');
        process.exit(1);
    }

    const sqlScript = fs.readFileSync(dumpPath, 'utf8');

    try {
        // First, connect without a specific database to ensure we can create it if it doesn't exist
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        const dbName = process.env.DB_NAME || 'wmsu_ipil_portal';

        console.log(`Ensuring database '${dbName}' exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.query(`USE \`${dbName}\`;`);

        console.log('Importing tables and data. This may take a few seconds...');
        await connection.query(sqlScript);

        console.log('Database import completed successfully!');
        await connection.end();
    } catch (err) {
        console.error('Error importing database:', err);
    }
}

importDatabase();
