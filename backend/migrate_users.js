const mysql = require('mysql2/promise');

async function run() {
  const con = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'xVtED0s^7@hh82bCv6',
    database: 'wmsu_portal'
  });
  
  try {
    // Add columns if they don't exist
    const [columns] = await con.query("SHOW COLUMNS FROM Users LIKE 'username'");
    if (columns.length === 0) {
      console.log("Adding username and setup_token columns...");
      await con.query('ALTER TABLE Users ADD COLUMN username VARCHAR(255) NULL UNIQUE AFTER last_name;');
      await con.query('ALTER TABLE Users ADD COLUMN setup_token VARCHAR(255) NULL AFTER password_hash;');
    } else {
      console.log("Columns already exist.");
    }
    
    // Update existing users to have a username based on first_name.last_name
    const [users] = await con.query('SELECT id, first_name, last_name FROM Users WHERE username IS NULL');
    for (const user of users) {
      let username = `${user.first_name}.${user.last_name}`.toLowerCase().replace(/\s+/g, '');
      console.log(`Setting username for user ${user.id} to ${username}`);
      try {
        await con.query('UPDATE Users SET username = ? WHERE id = ?', [username, user.id]);
      } catch (err) {
        console.error(`Error updating username for user ${user.id}:`, err.message);
      }
    }
    
    console.log("Database updated successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    con.end();
  }
}

run();
