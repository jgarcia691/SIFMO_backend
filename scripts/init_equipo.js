const { connectDB } = require('../config/database');

async function initEquipo() {
    try {
        const db = await connectDB();
        await db.exec(`
            CREATE TABLE IF NOT EXISTS Equipo (
                fmo INTEGER PRIMARY KEY,
                area_fk INTEGER,
                nombre TEXT,
                serial TEXT,
                marca_fk INTEGER,
                FOREIGN KEY (area_fk) REFERENCES Area_Departamento(id),
                FOREIGN KEY (marca_fk) REFERENCES Marca(id)
            );
        `);
        console.log('Tabla Equipo creada o ya existe.');
        process.exit(0);
    } catch (error) {
        console.error('Error creando la tabla Equipo:', error);
        process.exit(1);
    }
}

initEquipo();
