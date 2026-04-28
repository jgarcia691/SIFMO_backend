const { connectDB } = require('./config/database');

async function testQuery() {
    try {
        const db = await connectDB();
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
            LIMIT 1
        `;
        const result = await db.all(incidentQuery);
        console.log('Query successful:', result);
    } catch (error) {
        console.error('Query failed:', error);
    }
}

testQuery();
