const db = require('./config/db');

async function migrate() {
    try {
        console.log("Adding token_expires_at column to Users table...");
        await db.execute('ALTER TABLE Users ADD COLUMN token_expires_at DATETIME NULL;');
        console.log("Migration successful.");
    } catch(e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists. Skipping.");
        } else {
            console.error("Migration failed:", e);
        }
    }
    process.exit();
}

migrate();
