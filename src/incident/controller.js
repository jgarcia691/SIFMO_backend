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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getIncidents(req, res) {
    try {
        const incidents = await incidentService.getIncidents();
        res.status(200).json(incidents);
    } catch (error) {
        console.error('Error al obtener incidentes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getIncidentsByCliente(req, res) {
    try {
        const { clienteId } = req.params;
        const incidents = await incidentService.getIncidentsByCliente(clienteId);
        res.status(200).json(incidents);
    } catch (error) {
        console.error('Error al obtener incidentes por cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function updateIncident(req, res) {
    try {
        const { id } = req.params;
        const { encargado, status, fecha } = req.body;
        
        // Si no se envían encargado, status ni fecha, no hay nada que actualizar
        if (encargado === undefined && status === undefined && fecha === undefined) {
             return res.status(400).json({ error: 'Debe proporcionar un encargado, status o fecha para actualizar' });
        }
        
        // Obtener el incidente original para verificar si el estado cambia
        const originalIncident = await incidentService.getIncidentById(id);
        if (!originalIncident) {
            return res.status(404).json({ error: 'Incidente no encontrado' });
        }
        
        const changes = await incidentService.updateIncident(id, encargado, status, fecha);
        
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
                const html = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2 style="color: #0d6efd;">SIFMO - Actualización de Incidente</h2>
                        <p>Hola <strong>${originalIncident.solicitante}</strong>,</p>
                        <p>Le informamos que el estado de su incidente reportado (Tipo: <em>${originalIncident.tipo}</em>) ha cambiado.</p>
                        <p style="font-size: 16px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #0d6efd;">
                            <strong>Nuevo Estado:</strong> ${status}
                        </p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #6c757d;"><small>Este es un mensaje automático del Sistema de Incidencias SIFMO. Por favor, no responda a este correo.</small></p>
                    </div>
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
    getIncidentById,
    updateIncident,
    deleteIncident
};
