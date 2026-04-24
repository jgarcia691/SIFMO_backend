const { connectDB } = require('../../config/database');

async function createIncident(cliente, tipo) {
    const db = await connectDB();
    const result = await db.run(
        'INSERT INTO Incidente (cliente, tipo, status) VALUES (?, ?, ?)',
        [cliente, tipo, 'Pendiente']
    );
    // Recuperar el incidente creado para obtener la fecha generada por la DB
    const newIncident = await db.get('SELECT * FROM Incidente WHERE id = ?', [result.lastID]);
    return newIncident;
}

async function getIncidents() {
    const db = await connectDB();
    const incidents = await db.all('SELECT * FROM Incidente');
    return incidents;
}

async function getIncidentById(id) {
    const db = await connectDB();
    const incident = await db.get('SELECT * FROM Incidente WHERE id = ?', [id]);
    return incident;
}

async function updateIncident(id, encargado, status, fecha) {
    const db = await connectDB();
    // Permitir actualizar encargado, status y fecha
    const result = await db.run(
        'UPDATE Incidente SET encargado = COALESCE(?, encargado), status = COALESCE(?, status), fecha = COALESCE(?, fecha) WHERE id = ?',
        [
            encargado !== undefined ? encargado : null, 
            status !== undefined ? status : null, 
            fecha !== undefined ? fecha : null, 
            id
        ]
    );
    return result.changes;
}

async function deleteIncident(id) {
    const db = await connectDB();
    const result = await db.run('DELETE FROM Incidente WHERE id = ?', [id]);
    return result.changes;
}

module.exports = {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    deleteIncident
};
