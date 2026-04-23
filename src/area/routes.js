const express = require('express');
const router = express.Router();
const areaController = require('./controller');
const { verifyToken } = require('../middleware/auth');

// Proteger todas las rutas de áreas usando el middleware verifyToken
router.use(verifyToken);

router.post('/', areaController.createArea);
router.get('/', areaController.getAreas);
router.get('/:id', areaController.getAreaById);
router.put('/:id', areaController.updateArea);
router.delete('/:id', areaController.deleteArea);

module.exports = router;
