const express = require('express');
const router = express.Router();
const userController = require('./controller');

router.post('/', userController.createUser);
router.post('/login', userController.login);
router.get('/', userController.getUsers);
router.put('/:ficha', userController.updateUser);

module.exports = router;
