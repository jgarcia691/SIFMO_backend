const express = require('express');
const router = express.Router();
const areaController = require('./controller');
const { verifyToken } = require('../middleware/auth');

// Ruta pública para obtener las áreas (necesaria para el registro)
router.get('/listar/', areaController.getAreas);

// Proteger el resto de las rutas de áreas usando el middleware verifyToken
// router.use(verifyToken); // Comentado temporalmente

router.post('/crear/', areaController.createArea);
router.get('/listar/:id', areaController.getAreaById);
router.put('/actualizar/:id', areaController.updateArea);
router.delete('/eliminar/:id', areaController.deleteArea);

module.exports = router;
