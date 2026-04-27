const express = require('express');
const router = express.Router();
const equipoController = require('./controller');

router.get('/', equipoController.getEquipos);
router.get('/:fmo', equipoController.getEquipoByFmo);
router.post('/', equipoController.createEquipo);
router.put('/:fmo', equipoController.updateEquipo);
router.delete('/:fmo', equipoController.deleteEquipo);
router.get('/:fmo/historial', equipoController.getHistorial);

module.exports = router;
