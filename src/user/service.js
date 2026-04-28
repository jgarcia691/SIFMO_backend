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
    const user = await db.get(`
        SELECT u.*, a.nombre AS area 
        FROM Usuario u
        LEFT JOIN Area_Departamento a ON u.id_area = a.id
        WHERE u.ficha = ?
    `, [ficha]);
    return user;
}

async function getUsers() {
    const db = await connectDB();
    // Return users, possibly join with Area to give more context if needed
    // But for now just get them all to populate a dropdown
    const users = await db.all(`
        SELECT u.ficha, u.nombre, u.rol, u.id_area, u.numero, u.correo, a.nombre AS area 
        FROM Usuario u
        LEFT JOIN Area_Departamento a ON u.id_area = a.id
    `);
    return users;
}

async function updateUser(ficha, userData) {
    const { id_area, nombre, numero, correo } = userData;
    const db = await connectDB();
    const result = await db.run(
        `UPDATE Usuario SET 
            id_area = COALESCE(?, id_area), 
            nombre = COALESCE(?, nombre), 
            numero = COALESCE(?, numero), 
            correo = COALESCE(?, correo)
         WHERE ficha = ?`,
        [id_area, nombre, numero, correo, ficha]
    );
    return result.changes;
}

module.exports = {
    createUser,
    getUserByFicha,
    getUsers,
    updateUser
};
