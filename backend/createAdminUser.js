// createAdminUser.js
const pool = require('./db'); // Use './' to refer to the file in the same directory
const { encripteSenha } = require('./utils/auth'); // Adjusted path for auth.js

async function createAdminUser() {
    const nome = 'Admin User';
    const cpf = '12345678901';
    const email = 'admin@example.com';
    const senha = 'admin123'; // Replace with a strong password
    const id_cargo = 1; // Assuming 1 is the ID for 'admin' in the cargos table

    try {
        // Hash the password
        const hashedPassword = await encripteSenha(senha);

        // Insert the admin user
        const [result] = await pool.query(
            'INSERT INTO funcionarios (nome, cpf, email, senha, id_cargo) VALUES (?, ?, ?, ?, ?)',
            [nome, cpf, email, hashedPassword, id_cargo]
        );

        console.log('Admin user created with ID:', result.insertId);
    } catch (err) {
        console.error('Error creating admin user:', err);
    } finally {
        pool.end(); // Close the connection pool
    }
}

createAdminUser();
