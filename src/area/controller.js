const areaService = require('./service');

async function createArea(req, res) {
    try {
        const { nombre, telefono } = req.body;
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del área es obligatorio' });
        }
        
        const newArea = await areaService.createArea(nombre, telefono);
        res.status(201).json({ message: 'Área creada exitosamente', area: newArea });
    } catch (error) {
        console.error('Error al crear área:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getAreas(req, res) {
    try {
        const areas = await areaService.getAreas();
        res.status(200).json(areas);
    } catch (error) {
        console.error('Error al obtener áreas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getAreaById(req, res) {
    try {
        const { id } = req.params;
        const area = await areaService.getAreaById(id);
        
        if (!area) {
            return res.status(404).json({ error: 'Área no encontrada' });
        }
        
        res.status(200).json(area);
    } catch (error) {
        console.error('Error al obtener área:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function updateArea(req, res) {
    try {
        const { id } = req.params;
        const { nombre, telefono } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del área es obligatorio' });
        }
        
        const changes = await areaService.updateArea(id, nombre, telefono);
        if (changes === 0) {
            return res.status(404).json({ error: 'Área no encontrada' });
        }
        
        res.status(200).json({ message: 'Área actualizada exitosamente', area: { id, nombre, telefono } });
    } catch (error) {
        console.error('Error al actualizar área:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function deleteArea(req, res) {
    try {
        const { id } = req.params;
        const changes = await areaService.deleteArea(id);
        
        if (changes === 0) {
            return res.status(404).json({ error: 'Área no encontrada' });
        }
        
        res.status(200).json({ message: 'Área eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar área:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    createArea,
    getAreas,
    getAreaById,
    updateArea,
    deleteArea
};
