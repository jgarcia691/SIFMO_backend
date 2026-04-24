const { connectDB } = require('../../config/database');

async function createMarca(nombre, tipo) {
    const db = await connectDB();
    const result = await db.run(
        'INSERT INTO Marca (nombre, tipo) VALUES (?, ?)',
        [nombre, tipo]
    );
    return { id: result.lastID, nombre, tipo };
}

async function getMarcas() {
    const db = await connectDB();
    const marcas = await db.all('SELECT * FROM Marca');
    return marcas;
}

async function getMarcaById(id) {
    const db = await connectDB();
    const marca = await db.get('SELECT * FROM Marca WHERE id = ?', [id]);
    return marca;
}

async function updateMarca(id, nombre, tipo) {
    const db = await connectDB();
    const result = await db.run(
        'UPDATE Marca SET nombre = ?, tipo = ? WHERE id = ?',
        [nombre, tipo, id]
    );
    return result.changes;
}

async function deleteMarca(id) {
    const db = await connectDB();
    const result = await db.run('DELETE FROM Marca WHERE id = ?', [id]);
    return result.changes;
}

module.exports = {
    createMarca,
    getMarcas,
    getMarcaById,
    updateMarca,
    deleteMarca
};
