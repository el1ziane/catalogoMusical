const express = require('express');
const generoController = require('../controllers/generoController');
const pool = require('../db'); 
const router = express.Router();

router.get('/generos', generoController.getGeneros);

router.post('/cadastrarGenero', generoController.createGenero);

router.get('/formGenero', (req, res) => {
    res.render('formGenero');
});

router.get('/formGeneroEdit/:id', generoController.getFormGeneroEdicao);
router.put('/editarGenero/:id', generoController.updateGenero);

router.delete('/excluirGenero/:id', generoController.deleteGenero);

module.exports = router;
