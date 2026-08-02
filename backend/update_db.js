const mysql = require('mysql2/promise');

async function run() {
  const con = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'xVtED0s^7@hh82bCv6',
    database: 'wmsu_portal'
  });
  
  try {
    await con.query('SET FOREIGN_KEY_CHECKS = 0;');
    await con.query('TRUNCATE TABLE Roles;');
    await con.query(`
      INSERT INTO Roles (id, role_name) VALUES 
      (1, 'Superuser'), 
      (2, 'Admin'), 
      (3, 'Staff'), 
      (4, 'Student')
    `);
    
    // We should ensure the admin user is a superuser (role_id=1) since we wiped roles
    await con.query(`UPDATE Users SET role_id = 1 WHERE email = 'admin@example.com' OR email = 'superuser@example.com'`);
    
    await con.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Roles inserted successfully.');
    
    const [users] = await con.query('SELECT * FROM Users;');
    console.log('Current users:', users);
  } catch (err) {
    console.error(err);
  } finally {
    con.end();
  }
}

run();
