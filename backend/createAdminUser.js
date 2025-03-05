// createAdminUser.js
const pool = require('./db'); // Use './' to refer to the file in the same directory
const { encripteSenha } = require('./utils/auth'); // Adjusted path for auth.js

async function createAdminUser() {
    const nome = 'Admin User';
    const cpf = '12345678901';
    const email = 'adm@example.com';
    const senha = 'adm123';
    const cargo_id = 1;

    try {
        // Hash the password
        const hashedPassword = await encripteSenha(senha);

        // Insert the admin user
        const [result] = await pool.query(
            'INSERT INTO colaboradores (nome, cpf, email, senha, cargo_id) VALUES (?, ?, ?, ?, ?)',
            [nome, cpf, email, hashedPassword, cargo_id]
        );

        console.log('Admin user created with ID:', result.insertId);
    } catch (err) {
        console.error('Error creating admin user:', err);
    } finally {
        pool.end(); // Close the connection pool
    }
}

createAdminUser();
