const { connectDB } = require('../config/database');

async function migrate() {
    try {
        const db = await connectDB();
        console.log('Verificando si la columna "observacion" existe en la tabla "Incidente"...');
        
        const tableInfo = await db.all('PRAGMA table_info(Incidente)');
        const hasObservacion = tableInfo.some(column => column.name === 'observacion');
        
        if (!hasObservacion) {
            console.log('Agregando columna "observacion" a la tabla "Incidente"...');
            await db.run('ALTER TABLE Incidente ADD COLUMN observacion TEXT');
            console.log('Columna "observacion" agregada exitosamente.');
        } else {
            console.log('La columna "observacion" ya existe.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
