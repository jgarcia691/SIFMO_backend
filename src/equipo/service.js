const { connectDB } = require('../../config/database');

async function createEquipo(fmo, area_fk, tipo, nombre, serial, marca_fk, propietario_ficha = null) {
    const db = await connectDB();
    const result = await db.run(
        'INSERT INTO Equipo (fmo, area_fk, tipo, nombre, serial, marca_fk, propietario_ficha) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [fmo, area_fk, tipo, nombre, serial, marca_fk, propietario_ficha]
    );
    return { fmo, area_fk, tipo, nombre, serial, marca_fk, propietario_ficha };
}

async function getEquipos(userFicha = null, isAdmin = false) {
    const db = await connectDB();
    let query = `
        SELECT e.*, a.nombre as area_nombre, m.nombre as marca_nombre, u.nombre as propietario_nombre
        FROM Equipo e
        LEFT JOIN Area_Departamento a ON e.area_fk = a.id
        LEFT JOIN Marca m ON e.marca_fk = m.id
        LEFT JOIN Usuario u ON e.propietario_ficha = u.ficha
    `;
    
    let params = [];
    if (!isAdmin && userFicha) {
        query += ` WHERE e.propietario_ficha = ?`;
        params.push(userFicha);
    }
    
    const equipos = await db.all(query, params);
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

async function updateEquipo(fmo, area_fk, tipo, nombre, serial, marca_fk, propietario_ficha = null) {
    const db = await connectDB();
    const result = await db.run(
        'UPDATE Equipo SET area_fk = ?, tipo = ?, nombre = ?, serial = ?, marca_fk = ?, propietario_ficha = ? WHERE fmo = ?',
        [area_fk, tipo, nombre, serial, marca_fk, propietario_ficha, fmo]
    );
    return result.changes;
}

async function deleteEquipo(fmo) {
    const db = await connectDB();
    const result = await db.run('DELETE FROM Equipo WHERE fmo = ?', [fmo]);
    return result.changes;
}

async function getHistorialByFmo(fmo) {
    const db = await connectDB();
    const query = `
        SELECT i.*, rw.tipo_falla as workstation_falla, rp.falla as periferico_falla, 
               u.nombre as solicitante, e.nombre as encargado_nombre
        FROM Incidente i
        LEFT JOIN R_workstation rw ON i.id = rw.id
        LEFT JOIN R_periferico rp ON i.id = rp.id
        LEFT JOIN Usuario u ON i.cliente = u.ficha
        LEFT JOIN Usuario e ON i.encargado = e.ficha
        WHERE rw.cpu_fmo = ? OR rp.fmo = ?
        ORDER BY i.fecha DESC
    `;
    const historial = await db.all(query, [fmo, fmo]);
    return historial;
}

module.exports = {
    createEquipo,
    getEquipos,
    getEquipoByFmo,
    updateEquipo,
    deleteEquipo,
    getHistorialByFmo
};
