const { connectDB } = require('../../config/database');
const workstationService = require('../workstation/service');

async function createIncident(cliente, tipo, workstationData = null) {
    const db = await connectDB();
    
    const result = await db.run(
        'INSERT INTO Incidente (cliente, tipo, status) VALUES (?, ?, ?)',
        [cliente, tipo, 'Pendiente']
    );
    
    const incidentId = result.lastID;

    // Si el tipo es reparación de estación de trabajo, creamos el registro técnico
    if (tipo === 'reparacion de estacion de trabajo' && workstationData) {
        await workstationService.createWorkstationRecord(db, incidentId, workstationData);
    }

    // Recuperar el incidente creado para obtener la fecha generada por la DB
    const newIncident = await db.get('SELECT * FROM Incidente WHERE id = ?', [incidentId]);
    return newIncident;
}

async function getIncidents() {
    const db = await connectDB();
    const incidents = await db.all('SELECT * FROM Incidente');
    return incidents;
}

async function getIncidentsByCliente(clienteId) {
    const db = await connectDB();
    const incidents = await db.all('SELECT * FROM Incidente WHERE cliente = ?', [clienteId]);
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
    getIncidentsByCliente,
    getIncidentById,
    updateIncident,
    deleteIncident
};
