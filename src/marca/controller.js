const marcaService = require('./service');

async function createMarca(req, res) {
    try {
        const { nombre, tipo } = req.body;
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }
        const newMarca = await marcaService.createMarca(nombre, tipo);
        res.status(201).json(newMarca);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getMarcas(req, res) {
    try {
        const marcas = await marcaService.getMarcas();
        res.json(marcas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getMarcaById(req, res) {
    try {
        const { id } = req.params;
        const marca = await marcaService.getMarcaById(id);
        if (!marca) {
            return res.status(404).json({ error: 'Marca no encontrada' });
        }
        res.json(marca);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateMarca(req, res) {
    try {
        const { id } = req.params;
        const { nombre, tipo } = req.body;
        const changes = await marcaService.updateMarca(id, nombre, tipo);
        if (changes === 0) {
            return res.status(404).json({ error: 'Marca no encontrada o sin cambios' });
        }
        res.json({ message: 'Marca actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteMarca(req, res) {
    try {
        const { id } = req.params;
        const changes = await marcaService.deleteMarca(id);
        if (changes === 0) {
            return res.status(404).json({ error: 'Marca no encontrada' });
        }
        res.json({ message: 'Marca eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createMarca,
    getMarcas,
    getMarcaById,
    updateMarca,
    deleteMarca
};
