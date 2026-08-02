const db = require('./config/db');
async function check() {
    try {
        const [schema] = await db.query('DESCRIBE activitylogs');
        console.log(schema);
    } catch(e) {
        console.log(e);
    }
    process.exit();
}
check();
