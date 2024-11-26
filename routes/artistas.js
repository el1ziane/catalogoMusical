const express = require('express');
const artistaController = require('../controllers/artistaController');
const pool = require('../db'); 
const router = express.Router();

router.get('/artistas', artistaController.getArtistas);

router.post('/cadastrarArtista', artistaController.createArtista);

router.get('/formArtista', artistaController.getFormArtistaCriacao);

router.get('/formArtistaEdit/:id', artistaController.getFormArtistaEdicao);
router.put('/editarArtista/:id', artistaController.updateArtista);

router.delete('/excluirArtista/:id', artistaController.deleteArtista);

module.exports = router;
