const { connectDB } = require('../../config/database');
const workstationService = require('../workstation/service');

const incidentQuery = `
    SELECT 
        i.id,
        i.encargado,
        i.cliente,
        i.tipo,
        i.fecha,
        i.status,
        u.nombre AS solicitante,
        u.correo AS solicitante_correo,
        e.nombre AS encargado_nombre,
        e.correo AS encargado_correo,
        e.numero AS encargado_numero,
        a.nombre AS area,
        rw.cpu_fmo,
        rw.tipo_falla AS workstation_tipo_falla,
        rw.respaldo,
        rw.ram,
        rw.cant_ram,
        rw.cpu,
        rw.so,
        rw.disco,
        rw.tarj_video,
        rw.pila,
        rw.fuente,
        rw.motherboard,
        rw.tarj_red,
        rw.observacion AS workstation_observacion,
        rw.usuario AS workstation_usuario,
        rw.password,
        rp.falla AS periferico_falla,
        rp.tipo_solicitud AS periferico_tipo_solicitud,
        s.tipo_solicitud AS solicitud_tipo,
        s.descripcion AS solicitud_descripcion
    FROM Incidente i
    LEFT JOIN Usuario u ON CAST(i.cliente AS TEXT) = CAST(u.ficha AS TEXT)
    LEFT JOIN Usuario e ON CAST(i.encargado AS TEXT) = CAST(e.ficha AS TEXT)
    LEFT JOIN Area_Departamento a ON u.id_area = a.id
    LEFT JOIN R_workstation rw ON i.id = rw.id
    LEFT JOIN R_periferico rp ON i.id = rp.id
    LEFT JOIN Solicitud s ON i.id = s.id
`;

async function createIncident(cliente, tipo, workstationData = null, peripheralData = null, solicitudData = null) {
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

    // Si el tipo es reparación de periférico, insertamos en R_periferico
    // Asumimos tabla (id, falla, tipo_solicitud)
    if (tipo === 'reparacion de periferico' && peripheralData) {
        // Aseguramos que la tabla exista temporalmente por si acaso
        await db.exec(`CREATE TABLE IF NOT EXISTS R_periferico (
            id INTEGER PRIMARY KEY,
            falla TEXT,
            tipo_solicitud TEXT,
            FOREIGN KEY(id) REFERENCES Incidente(id) ON DELETE CASCADE
        )`);
        await db.run('INSERT INTO R_periferico (id, falla, tipo_solicitud) VALUES (?, ?, ?)', 
            [incidentId, peripheralData.falla, peripheralData.tipo_solicitud]);
    }

    // Si el tipo es solicitud, insertamos en Solicitud
    // Asumimos tabla (id, tipo_solicitud, descripcion)
    if (tipo === 'solicitud' && solicitudData) {
        await db.exec(`CREATE TABLE IF NOT EXISTS Solicitud (
            id INTEGER PRIMARY KEY,
            tipo_solicitud TEXT,
            descripcion TEXT,
            FOREIGN KEY(id) REFERENCES Incidente(id) ON DELETE CASCADE
        )`);
        await db.run('INSERT INTO Solicitud (id, tipo_solicitud, descripcion) VALUES (?, ?, ?)', 
            [incidentId, solicitudData.tipo_solicitud, solicitudData.descripcion]);
    }

    // Recuperar el incidente creado con todos sus detalles
    const newIncident = await db.get(`${incidentQuery} WHERE i.id = ?`, [incidentId]);
    return newIncident;
}

async function getIncidents() {
    const db = await connectDB();
    const incidents = await db.all(incidentQuery);
    return incidents;
}

async function getIncidentsByCliente(clienteId) {
    const db = await connectDB();
    const incidents = await db.all(`${incidentQuery} WHERE i.cliente = ?`, [clienteId]);
    return incidents;
}

async function getIncidentById(id) {
    const db = await connectDB();
    const incident = await db.get(`${incidentQuery} WHERE i.id = ?`, [id]);
    return incident;
}

async function updateIncident(id, encargado, status, fecha) {
    const db = await connectDB();
    // Permitir actualizar encargado, status y fecha
    const result = await db.run(
        'UPDATE Incidente SET encargado = ?, status = COALESCE(?, status), fecha = COALESCE(?, fecha) WHERE id = ?',
        [
            encargado !== undefined ? (encargado === "" ? null : encargado) : undefined, 
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
