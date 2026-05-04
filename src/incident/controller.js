const incidentService = require('./service');
const { sendMail } = require('../utils/mailer');

async function createIncident(req, res) {
    try {
        const { cliente, tipo, workstationData, peripheralData, solicitudData } = req.body;
        
        if (!cliente || !tipo) {
            return res.status(400).json({ error: 'El cliente y el tipo de incidente son obligatorios' });
        }
        
        const newIncident = await incidentService.createIncident(cliente, tipo, workstationData, peripheralData, solicitudData);
        res.status(201).json({ message: 'Incidente creado exitosamente', incident: newIncident });
    } catch (error) {
        console.error('Error al crear incidente:', error);
        res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
}

async function getIncidents(req, res) {
    try {
        const incidents = await incidentService.getIncidents();
        res.status(200).json(incidents);
    } catch (error) {
        console.error('Error al obtener incidentes:', error);
        res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
}

async function getIncidentsByCliente(req, res) {
    try {
        const { clienteId } = req.params;
        const incidents = await incidentService.getIncidentsByCliente(clienteId);
        res.status(200).json(incidents);
    } catch (error) {
        console.error('Error al obtener incidentes por cliente:', error);
        res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
}

async function getIncidentsByAnalista(req, res) {
    try {
        const { ficha } = req.params;
        const incidents = await incidentService.getIncidentsByAnalista(ficha);
        res.status(200).json(incidents);
    } catch (error) {
        console.error('Error al obtener incidentes por analista:', error);
        res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
}

async function getIncidentById(req, res) {
    try {
        const { id } = req.params;
        const incident = await incidentService.getIncidentById(id);
        
        if (!incident) {
            return res.status(404).json({ error: 'Incidente no encontrado' });
        }
        
        res.status(200).json(incident);
    } catch (error) {
        console.error('Error al obtener incidente:', error);
        res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
}

async function updateIncident(req, res) {
    try {
        const { id } = req.params;
        const { encargado, status, fecha, observacion } = req.body;
        
        // Si no se envían encargado, status, fecha ni observacion, no hay nada que actualizar
        if (encargado === undefined && status === undefined && fecha === undefined && observacion === undefined) {
             return res.status(400).json({ error: 'Debe proporcionar un encargado, status, fecha u observacion para actualizar' });
        }
        
        // Obtener el incidente original para verificar si el estado cambia
        const originalIncident = await incidentService.getIncidentById(id);
        if (!originalIncident) {
            return res.status(404).json({ error: 'Incidente no encontrado' });
        }
        
        const changes = await incidentService.updateIncident(id, encargado, status, fecha, observacion);
        
        if (changes === 0) {
            return res.status(404).json({ error: 'Incidente no encontrado' });
        }
        
        let emailSent = false;
        // Enviar correo si el estado cambió
        if (status !== undefined && originalIncident.status !== status) {
            const correoDestino = originalIncident.solicitante_correo;
            if (correoDestino) {
                const asunto = `Actualización de Incidente #${id}: Nuevo Estado - ${status}`;
                const texto = `Hola ${originalIncident.solicitante},\n\nEl estado de su incidente (Tipo: ${originalIncident.tipo}) ha sido actualizado a: ${status}.\n\nSaludos,\nEquipo de Soporte SIFMO.`;
                const statusMessages = {
                    'Pendiente': 'Su solicitud ha sido recibida y está a la espera de ser asignada a un técnico.',
                    'En revisión': 'Un técnico está revisando los detalles de su caso para determinar la mejor solución.',
                    'En Proceso': 'Nuestro equipo está trabajando activamente en la resolución de su incidencia.',
                    'Listo': 'Su equipo ha sido reparado y está listo para ser retirado.',
                    'Entregado': 'El equipo ha sido entregado satisfactoriamente. Gracias por confiar en nosotros.',
                    'Completado': 'La incidencia ha sido resuelta y el caso ha sido cerrado.'
                };
                const statusDetail = statusMessages[status] || 'Nuestro equipo técnico está trabajando para resolver su solicitud lo antes posible.';

                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            @media screen and (max-width: 600px) {
                                .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
                                .content { padding: 20px !important; }
                            }
                        </style>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
                        <div class="container" style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e0e0e0;">
                            <div style="background-color: #6f0001; padding: 35px 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">SGI-FMO</h1>
                                <p style="color: #ffffff; margin: 5px 0 0; font-size: 11px; opacity: 0.7; font-weight: 400; text-transform: uppercase; letter-spacing: 1px;">Gestión de Incidencias Ferroviarias</p>
                            </div>
                            <div class="content" style="padding: 40px 35px;">
                                <h2 style="color: #1a1c1c; margin-top: 0; font-size: 22px; font-weight: 700;">Hola, ${originalIncident.solicitante}</h2>
                                <p style="color: #444748; line-height: 1.7; font-size: 16px; margin-bottom: 30px;">
                                    Le notificamos que el estado de su reporte ha sido actualizado en nuestra plataforma.
                                </p>
                                <div style="margin: 30px 0; padding: 25px; background-color: #ffffff; border-radius: 10px; border: 1px solid #f0f0f0; border-left: 6px solid #6f0001;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px 0; color: #747878; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">ID Incidente</td>
                                            <td style="padding: 8px 0; color: #1a1c1c; font-weight: 700; font-size: 15px;">#${id}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #747878; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Categoría</td>
                                            <td style="padding: 8px 0; color: #1a1c1c; font-weight: 700; font-size: 15px; text-transform: uppercase;">${originalIncident.tipo}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 15px 0 8px; color: #747878; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Estado Actual</td>
                                            <td style="padding: 15px 0 8px;">
                                                <span style="background-color: #6f0001; color: #ffffff; padding: 6px 16px; border-radius: 6px; font-size: 12px; font-weight: 800; text-transform: uppercase; display: inline-block;">
                                                    ${status}
                                                </span>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <div style="background-color: #fff8f8; padding: 20px; border-radius: 8px; border: 1px dashed #ffdad5;">
                                    <p style="color: #6f0001; line-height: 1.6; font-size: 15px; margin: 0; font-weight: 500;">
                                        <strong>Detalle:</strong> ${statusDetail}
                                    </p>
                                </div>
                            </div>
                            <div style="background-color: #f9f9f9; padding: 25px; text-align: center; border-top: 1px solid #f0f0f0;">
                                <p style="margin: 0; font-size: 11px; color: #747878; line-height: 1.5; font-weight: 400;">
                                    Este es un mensaje automático de <strong>SGI-FMO</strong>.<br>
                                    CVG FERROMINERA ORINOCO &copy; 2026<br>
                                    <span style="opacity: 0.6;">Puerto Ordaz, Venezuela</span>
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;
                
                try {
                    emailSent = await sendMail(correoDestino, asunto, texto, html);
                } catch (err) {
                    console.error('Error enviando correo:', err);
                }
            } else {
                console.warn(`No se pudo enviar correo: el usuario con ficha ${originalIncident.cliente} no tiene correo registrado.`);
            }
        }
        
        res.status(200).json({ message: 'Incidente actualizado exitosamente', emailSent });
    } catch (error) {
        console.error('Error al actualizar incidente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function deleteIncident(req, res) {
    try {
        const { id } = req.params;
        const changes = await incidentService.deleteIncident(id);
        
        if (changes === 0) {
            return res.status(404).json({ error: 'Incidente no encontrado' });
        }
        
        res.status(200).json({ message: 'Incidente eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar incidente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
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
