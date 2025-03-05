// scripts/hashPassword.js
const bcrypt = require('bcrypt');

// Hash the password
const hashPassword = async (password) => {
    const saltRounds = 10; // Number of rounds for hashing
    return await bcrypt.hash(password, saltRounds);
};

// Example: Hash the admin password
const adminPassword = 'admin123'; // Replace with a strong password
hashPassword(adminPassword).then((hashedPassword) => {
    console.log('Hashed Password:', hashedPassword);
});