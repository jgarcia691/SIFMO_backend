const workstationService = require('./service');

async function getWorkstations(req, res) {
    try {
        const workstations = await workstationService.getWorkstations();
        res.status(200).json(workstations);
    } catch (error) {
        console.error('Error al obtener workstations:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getWorkstationById(req, res) {
    try {
        const { id } = req.params;
        const workstation = await workstationService.getWorkstationById(id);
        
        if (!workstation) {
            return res.status(404).json({ error: 'Registro de workstation no encontrado' });
        }
        
        res.status(200).json(workstation);
    } catch (error) {
        console.error('Error al obtener workstation:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function updateWorkstation(req, res) {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const changes = await workstationService.updateWorkstation(id, data);
        
        if (changes === 0) {
            return res.status(404).json({ error: 'Registro de workstation no encontrado' });
        }
        
        res.status(200).json({ message: 'Registro de workstation actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar workstation:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function deleteWorkstation(req, res) {
    try {
        const { id } = req.params;
        const changes = await workstationService.deleteWorkstation(id);
        
        if (changes === 0) {
            return res.status(404).json({ error: 'Registro de workstation no encontrado' });
        }
        
        res.status(200).json({ message: 'Registro de workstation eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar workstation:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    getWorkstations,
    getWorkstationById,
    updateWorkstation,
    deleteWorkstation
};
