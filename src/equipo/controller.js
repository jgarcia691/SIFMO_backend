const equipoService = require('./service');

async function createEquipo(req, res) {
    try {
        const { fmo, area_fk, nombre, serial, marca_fk } = req.body;
        if (!fmo || !nombre) {
            return res.status(400).json({ error: 'FMO y nombre son obligatorios' });
        }
        const newEquipo = await equipoService.createEquipo(fmo, area_fk, nombre, serial, marca_fk);
        res.status(201).json(newEquipo);
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'El FMO ya existe' });
        }
        res.status(500).json({ error: error.message });
    }
}

async function getEquipos(req, res) {
    try {
        const equipos = await equipoService.getEquipos();
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getEquipoByFmo(req, res) {
    try {
        const { fmo } = req.params;
        const equipo = await equipoService.getEquipoByFmo(fmo);
        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        res.json(equipo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateEquipo(req, res) {
    try {
        const { fmo } = req.params;
        const { area_fk, nombre, serial, marca_fk } = req.body;
        const changes = await equipoService.updateEquipo(fmo, area_fk, nombre, serial, marca_fk);
        if (changes === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado o sin cambios' });
        }
        res.json({ message: 'Equipo actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteEquipo(req, res) {
    try {
        const { fmo } = req.params;
        const changes = await equipoService.deleteEquipo(fmo);
        
        if (changes === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        
        res.status(200).json({ message: 'Equipo eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getHistorial(req, res) {
    try {
        const { fmo } = req.params;
        const historial = await equipoService.getHistorialByFmo(fmo);
        res.status(200).json(historial);
    } catch (error) {
        console.error('Error al obtener historial de equipo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    createEquipo,
    getEquipos,
    getEquipoByFmo,
    updateEquipo,
    deleteEquipo,
    getHistorial
};
