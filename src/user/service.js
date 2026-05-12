const { connectDB } = require('../../config/database');
const bcrypt = require('bcrypt');

async function createUser(userData) {
    const { ficha, id_area, nombre, rol, numero, correo, password } = userData;
    const db = await connectDB();

    // Verificar si el usuario ya existe
    const existingUser = await db.get('SELECT ficha FROM Usuario WHERE ficha = ?', [ficha]);
    if (existingUser) {
        throw new Error('El usuario con esta ficha ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
        `INSERT INTO Usuario (ficha, id_area, nombre, rol, numero, correo, password)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ficha, id_area, nombre, rol, numero, correo, hashedPassword]
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
    const { id_area, nombre, numero, correo, password } = userData;
    const db = await connectDB();
    
    let query = `UPDATE Usuario SET 
            id_area = COALESCE(?, id_area), 
            nombre = COALESCE(?, nombre), 
            numero = COALESCE(?, numero), 
            correo = COALESCE(?, correo)`;
    
    let params = [id_area, nombre, numero, correo];

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += `, password = ?`;
        params.push(hashedPassword);
    }

    query += ` WHERE ficha = ?`;
    params.push(ficha);

    const result = await db.run(query, params);
    return result.changes;
}

async function deleteUser(ficha) {
    const db = await connectDB();
    const result = await db.run('DELETE FROM Usuario WHERE ficha = ?', [ficha]);
    return result.changes;
}

module.exports = {
    createUser,
    getUserByFicha,
    getUsers,
    updateUser,
    deleteUser
};
