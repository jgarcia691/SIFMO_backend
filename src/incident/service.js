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
        i.observacion,
        u.nombre AS solicitante,
        u.correo AS solicitante_correo,
        u.numero AS solicitante_numero,
        e.nombre AS encargado_nombre,
        e.correo AS encargado_correo,
        e.numero AS encargado_numero,
        a.nombre AS area,
        u.id_area AS extension,
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
        rp.fmo AS periferico_fmo,
        rp.falla AS periferico_falla,
        ep.nombre AS periferico_nombre,
        ep.serial AS periferico_serial,
        mp.nombre AS periferico_marca,
        ep.tipo AS periferico_tipo,
        s.tipo_solicitud AS solicitud_tipo,
        s.descripcion AS solicitud_descripcion,
        s.area_id AS solicitud_area_id
    FROM Incidente i
    LEFT JOIN Usuario u ON i.cliente = u.ficha
    LEFT JOIN Usuario e ON i.encargado = e.ficha
    LEFT JOIN Area_Departamento a ON u.id_area = a.id
    LEFT JOIN R_workstation rw ON i.id = rw.id
    LEFT JOIN R_periferico rp ON i.id = rp.id
    LEFT JOIN Equipo ep ON rp.fmo = ep.fmo
    LEFT JOIN Marca mp ON ep.marca_fk = mp.id
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

    // Si el tipo es reparación de periférico, insertamos en R_periferico (id, fmo, falla)
    if (tipo === 'reparacion de periferico' && peripheralData) {
        await db.run('INSERT INTO R_periferico (id, fmo, falla) VALUES (?, ?, ?)', 
            [incidentId, peripheralData.fmo, peripheralData.falla]);
    }

    // Si el tipo es solicitud, insertamos en Solicitud (id, tipo_solicitud, descripcion, area_id)
    if (tipo === 'solicitud' && solicitudData) {
        await db.run('INSERT INTO Solicitud (id, tipo_solicitud, descripcion, area_id) VALUES (?, ?, ?, ?)', 
            [incidentId, solicitudData.tipo_solicitud, solicitudData.descripcion, solicitudData.area_id]);
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

async function getIncidentsByAnalista(analistaFicha) {
    const db = await connectDB();
    const incidents = await db.all(`${incidentQuery} WHERE i.encargado = ?`, [analistaFicha]);
    return incidents;
}

async function getIncidentById(id) {
    const db = await connectDB();
    const incident = await db.get(`${incidentQuery} WHERE i.id = ?`, [id]);
    return incident;
}

async function updateIncident(id, encargado, status, fecha, observacion) {
    const db = await connectDB();
    // Permitir actualizar encargado, status, fecha y observacion
    const result = await db.run(
        `UPDATE Incidente SET 
            encargado = CASE WHEN ? = 1 THEN ? ELSE encargado END, 
            status = COALESCE(?, status), 
            fecha = COALESCE(?, fecha), 
            observacion = COALESCE(?, observacion) 
         WHERE id = ?`,
        [
            encargado !== undefined ? 1 : 0,
            encargado !== undefined ? (encargado === "" ? null : encargado) : null,
            status !== undefined ? status : null, 
            fecha !== undefined ? fecha : null, 
            observacion !== undefined ? observacion : null,
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
    getIncidentsByAnalista,
    getIncidentById,
    updateIncident,
    deleteIncident
};
