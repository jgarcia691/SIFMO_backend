const { connectDB } = require('../config/database');

async function initMarca() {
    try {
        const db = await connectDB();
        await db.exec(`
            CREATE TABLE IF NOT EXISTS Marca (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                tipo TEXT
            );
        `);
        console.log('Tabla Marca creada o ya existe.');
        process.exit(0);
    } catch (error) {
        console.error('Error creando la tabla Marca:', error);
        process.exit(1);
    }
}

initMarca();
