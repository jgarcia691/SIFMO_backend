const incidentService = require('./service');

async function createIncident(req, res) {
    try {
        const { cliente, tipo } = req.body;
        
        if (!cliente || !tipo) {
            return res.status(400).json({ error: 'El cliente y el tipo de incidente son obligatorios' });
        }
        
        const newIncident = await incidentService.createIncident(cliente, tipo);
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
        
        const changes = await incidentService.updateIncident(id, encargado, status, fecha);
        
        if (changes === 0) {
            return res.status(404).json({ error: 'Incidente no encontrado' });
        }
        
        res.status(200).json({ message: 'Incidente actualizado exitosamente' });
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
    getIncidentById,
    updateIncident,
    deleteIncident
};
