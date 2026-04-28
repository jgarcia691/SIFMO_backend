const { connectDB } = require('../config/database');

async function debug() {
    try {
        const db = await connectDB();
        console.log('--- Buscando incidencias asignadas a ficha 777 ---');
        const incidents = await db.all('SELECT * FROM Incidente WHERE encargado = ?', [777]);
        console.log('Incidencias encontradas:', incidents);

        console.log('\n--- Verificando datos del usuario 777 ---');
        const user = await db.get('SELECT * FROM Usuario WHERE ficha = ?', [777]);
        console.log('Usuario:', user);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debug();
