// database.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Función única para conectarse a tu base de datos ya existente
async function connectDB() {
    return open({
        filename: './SIFMO.db',
        driver: sqlite3.Database
    });
}

module.exports = { connectDB };