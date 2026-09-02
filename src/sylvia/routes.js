const express = require('express');
const router = express.Router();
const sylviaController = require('./controller');

router.post('/chat', sylviaController.handleSylviaChat);

module.exports = router;
