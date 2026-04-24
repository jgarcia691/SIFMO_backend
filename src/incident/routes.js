const express = require('express');
const router = express.Router();
const incidentController = require('./controller');
const { verifyToken } = require('../middleware/auth');

// Proteger todas las rutas de incidentes usando el middleware verifyToken
// router.use(verifyToken); // Comentado temporalmente por ahora

router.post('/crear/', incidentController.createIncident);
router.get('/listar/', incidentController.getIncidents);
router.get('/listar/cliente/:clienteId', incidentController.getIncidentsByCliente);
router.get('/listar/:id', incidentController.getIncidentById);
router.put('/actualizar/:id', incidentController.updateIncident);
router.delete('/eliminar/:id', incidentController.deleteIncident);

module.exports = router;
