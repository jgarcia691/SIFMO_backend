const { connectDB } = require('../../config/database');

async function createUser(userData) {
    const { ficha, id_area, nombre, rol, numero, correo } = userData;
    const db = await connectDB();

    // Verificar si el usuario ya existe
    const existingUser = await db.get('SELECT ficha FROM Usuario WHERE ficha = ?', [ficha]);
    if (existingUser) {
        throw new Error('El usuario con esta ficha ya existe');
    }

    const result = await db.run(
        `INSERT INTO Usuario (ficha, id_area, nombre, rol, numero, correo)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ficha, id_area, nombre, rol, numero, correo]
    );

    return result;
}

async function getUserByFicha(ficha) {
    const db = await connectDB();
    const user = await db.get('SELECT * FROM Usuario WHERE ficha = ?', [ficha]);
    return user;
}

async function getUsers() {
    const db = await connectDB();
    // Return users, possibly join with Area to give more context if needed
    // But for now just get them all to populate a dropdown
    const users = await db.all('SELECT ficha, nombre, rol, id_area FROM Usuario');
    return users;
}

module.exports = {
    createUser,
    getUserByFicha,
    getUsers
};
