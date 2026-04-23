const { connectDB } = require('../../config/database');

async function createUser(userData) {
    const { ficha, id_area, nombre, rol, numero, correo } = userData;
    const db = await connectDB();
    
    // Verificar si el usuario ya existe
    const existingUser = await db.get('SELECT ficha FROM usuario WHERE ficha = ?', [ficha]);
    if (existingUser) {
        throw new Error('El usuario con esta ficha ya existe');
    }

    const result = await db.run(
        `INSERT INTO usuario (ficha, id_area, nombre, rol, numero, correo)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ficha, id_area, nombre, rol, numero, correo]
    );

    return result;
}

async function getUserByFicha(ficha) {
    const db = await connectDB();
    const user = await db.get('SELECT * FROM usuario WHERE ficha = ?', [ficha]);
    return user;
}

module.exports = {
    createUser,
    getUserByFicha
};
