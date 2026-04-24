const express = require('express');
const router = express.Router();
const workstationController = require('./controller');
const { verifyToken } = require('../middleware/auth');

// Por ahora sin protección de token como los incidentes
// router.use(verifyToken);

router.get('/listar/', workstationController.getWorkstations);
router.get('/listar/:id', workstationController.getWorkstationById);
router.put('/actualizar/:id', workstationController.updateWorkstation);
router.delete('/eliminar/:id', workstationController.deleteWorkstation);

module.exports = router;
