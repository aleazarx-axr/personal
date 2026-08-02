const db = require('./config/db');


async function testUsername() {
    try {
        console.log("Testing Username Generation with 'John Mark Cruz'");
        const payload = {
            role_id: 1,
            first_name: "John Mark",
            last_name: "Cruz",
            email: "john.cruz.test1@example.com",
            password: "password123"
        };
        
        // Ensure clean slate
        await db.query('DELETE FROM Users WHERE email LIKE ? OR username LIKE ?', ['%john.cruz%', '%cruz%']);
        
        // Attempt 1: Should be 'john.cruz'
        let res1 = await fetch('http://localhost:5000/api/users/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        console.log("Response 1:", await res1.json());
        
        // Attempt 2: Should be 'johnmark.cruz'
        payload.email = "john.cruz.test2@example.com";
        let res2 = await fetch('http://localhost:5000/api/users/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        console.log("Response 2:", await res2.json());
        
        // Attempt 3: Should be 'johnmark.cruz1'
        payload.email = "john.cruz.test3@example.com";
        let res3 = await fetch('http://localhost:5000/api/users/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        console.log("Response 3:", await res3.json());
        
        const [users] = await db.query('SELECT username, token_expires_at FROM Users WHERE email LIKE ?', ['%john.cruz.test%']);
        console.log("Users in DB:", users);

        // Cleanup
        await db.query('DELETE FROM Users WHERE email LIKE ? OR username LIKE ?', ['%john.cruz%', '%cruz%']);
        
    } catch (e) {
        console.error("Test failed:", e.response?.data || e.message);
    }
    process.exit();
}

testUsername();
