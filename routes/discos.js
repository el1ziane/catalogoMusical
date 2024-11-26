const express = require('express');
const discoController = require('../controllers/discoController');
const pool = require('../db'); 
const router = express.Router();

router.get('/discos', discoController.getDiscos);

router.get('/formDisco', discoController.getFormDiscoCriacao);

router.get('/formDiscoEdit/:id', discoController.getFormDiscoEdicao);
router.put('/editarDisco/:id', discoController.updateDisco);

router.post('/cadastrarDisco', discoController.createDisco);

router.delete('/excluir/:id', discoController.deleteDisco);

module.exports = router;
