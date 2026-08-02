require('dotenv').config();
const mysqldump = require('mysqldump');
const path = require('path');

const dumpPath = path.join(__dirname, '..', 'database.sql');

mysqldump({
    connection: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'wmsu_ipil_portal',
    },
    dumpToFile: dumpPath,
}).then(() => {
    console.log(`Database successfully exported to: ${dumpPath}`);
}).catch((err) => {
    console.error('Error exporting database:', err);
});
