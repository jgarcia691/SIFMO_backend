const { connectDB } = require('../../config/database');

async function createEquipo(fmo, area_fk, nombre, serial, marca_fk) {
    const db = await connectDB();
    const result = await db.run(
        'INSERT INTO Equipo (fmo, area_fk, nombre, serial, marca_fk) VALUES (?, ?, ?, ?, ?)',
        [fmo, area_fk, nombre, serial, marca_fk]
    );
    return { fmo, area_fk, nombre, serial, marca_fk };
}

async function getEquipos() {
    const db = await connectDB();
    const query = `
        SELECT e.*, a.nombre as area_nombre, m.nombre as marca_nombre 
        FROM Equipo e
        LEFT JOIN Area_Departamento a ON e.area_fk = a.id
        LEFT JOIN Marca m ON e.marca_fk = m.id
    `;
    const equipos = await db.all(query);
    return equipos;
}

async function getEquipoByFmo(fmo) {
    const db = await connectDB();
    const query = `
        SELECT e.*, a.nombre as area_nombre, m.nombre as marca_nombre 
        FROM Equipo e
        LEFT JOIN Area_Departamento a ON e.area_fk = a.id
        LEFT JOIN Marca m ON e.marca_fk = m.id
        WHERE e.fmo = ?
    `;
    const equipo = await db.get(query, [fmo]);
    return equipo;
}

async function updateEquipo(fmo, area_fk, nombre, serial, marca_fk) {
    const db = await connectDB();
    const result = await db.run(
        'UPDATE Equipo SET area_fk = ?, nombre = ?, serial = ?, marca_fk = ? WHERE fmo = ?',
        [area_fk, nombre, serial, marca_fk, fmo]
    );
    return result.changes;
}

async function deleteEquipo(fmo) {
    const db = await connectDB();
    const result = await db.run('DELETE FROM Equipo WHERE fmo = ?', [fmo]);
    return result.changes;
}

module.exports = {
    createEquipo,
    getEquipos,
    getEquipoByFmo,
    updateEquipo,
    deleteEquipo
};
