const Genero = require('../models/Genero');
const pool = require('../db');

const generoModel = new Genero(pool);

const getGeneros = (req, res) => {
    generoModel.getAllGeneros()
        .then(generos => {
            res.render('generos', { generos });
        })
        .catch(err => {
            res.status(500).send('Erro ao carregar gêneros');
        });
};

const createGenero = (req, res) => {
    const { nome } = req.body;
    generoModel.createGenero(nome)
        .then(() => {
            res.redirect('/generos');
        })
        .catch(err => {
            res.status(500).send('Erro ao criar gênero');
        });
};

const getFormGeneroEdicao = async (req, res) => {
    const generoId = req.params.id;

    try {
        const genero = await generoModel.getGeneroById(generoId);
        if (!genero) {
            return res.status(404).send('Gênero não encontrado');
        }
        res.render('formGeneroEdit', { genero });
    } catch (err) {
        res.status(500).send('Erro ao carregar dados do formulário');
    }
};

const updateGenero = (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;

    generoModel.updateGenero(id, nome)
        .then(() => {
            res.status(200).json({ success: true, message: 'Gênero atualizado com sucesso' });
        })
        .catch(err => {
            res.status(500).json({ success: false, error: 'Erro ao atualizar gênero' });
        });
};

const deleteGenero = async (req, res) => {
    const { id } = req.params;

    try {
        await generoModel.deleteGenero(id);
        res.status(200).json({ message: 'Genero excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao excluir' });
    }
};

module.exports = {
    getGeneros,
    createGenero,
    updateGenero,
    deleteGenero,
    getFormGeneroEdicao
};
