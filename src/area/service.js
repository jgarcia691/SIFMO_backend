const { connectDB } = require('../../config/database');

async function createArea(nombre, telefono) {
    const db = await connectDB();
    const result = await db.run(
        'INSERT INTO Area_Departamento (nombre, telefono) VALUES (?, ?)',
        [nombre, telefono]
    );
    return { id: result.lastID, nombre, telefono };
}

async function getAreas() {
    const db = await connectDB();
    const areas = await db.all('SELECT * FROM Area_Departamento');
    return areas;
}

async function getAreaById(id) {
    const db = await connectDB();
    const area = await db.get('SELECT * FROM Area_Departamento WHERE id = ?', [id]);
    return area;
}

async function updateArea(id, nombre, telefono) {
    const db = await connectDB();
    const result = await db.run(
        'UPDATE Area_Departamento SET nombre = ?, telefono = ? WHERE id = ?',
        [nombre, telefono, id]
    );
    return result.changes; // Returns the number of rows affected
}

async function deleteArea(id) {
    const db = await connectDB();
    const result = await db.run('DELETE FROM Area_Departamento WHERE id = ?', [id]);
    return result.changes;
}

module.exports = {
    createArea,
    getAreas,
    getAreaById,
    updateArea,
    deleteArea
};
