const Disco = require('../models/Disco');
const pool = require('../db');
const upload = require('../public/upload');

const discoModel = new Disco(pool);

const getDiscos = (req, res) => {
    discoModel.getAllDiscos()
        .then(discos => {
            res.render('discos', { discos });
        })
        .catch(err => {
            res.status(500).send('Erro ao carregar discos');
        });
};

const getFormDiscoCriacao = async (req, res) => {
    try {
        const generos = await discoModel.getAllGeneros();
        res.render('formDisco', { 
            generos, 
            disco: {}, 
            generosSelecionados: [] 
        });
    } catch (err) {
        res.status(500).send('Erro ao carregar dados do formulário');
    }
};

const getFormDiscoEdicao = async (req, res) => {
    try {
        const generos = await discoModel.getAllGeneros();
        const discoId = req.params.id;
        let disco = await discoModel.getDiscoById(discoId);

        if (!disco) {
            return res.status(404).send('Disco não encontrado');
        }

        const generosDoDisco = await discoModel.getGenerosByDiscoId(discoId);
        const generosSelecionados = generosDoDisco.map(genero => genero.id);
        const faixasDoDisco = await discoModel.getFaixasByDiscoId(discoId);

        res.render('formDiscoEdit', { 
            generos, 
            disco, 
            generosSelecionados, 
            faixasDoDisco 
        });
    } catch (err) {
        res.status(500).send('Erro ao carregar dados do formulário');
    }
};

const createDisco = (req, res) => {
    upload.single('capa')(req, res, async (err) => {
        if (err) {
            return res.status(400).send('Erro no upload da capa');
        }

        const { titulo, ano_lancamento, genero_id, faixas } = req.body;
        let generos = Array.isArray(genero_id) ? genero_id : [genero_id];
        generos = generos.filter(genero_id => genero_id && typeof genero_id === 'string' && genero_id.trim() !== '');

        if (!generos || generos.length === 0) {
            return res.status(400).send('O campo "gêneros" deve ser um array não vazio.');
        }

        const capa = req.file ? req.file.filename : null;
        let listaFaixas = Array.isArray(faixas) ? faixas : [faixas];
        listaFaixas = listaFaixas.filter(faixa => faixa && faixa.trim() !== '');

        try {
            const discoId = await discoModel.createDisco(titulo, ano_lancamento, capa, generos, listaFaixas);

            if (generos && generos.length > 0) {
                await discoModel.addGenerosToDisco(discoId, generos);
            }

            if (listaFaixas && listaFaixas.length > 0) {
                await discoModel.addFaixasToDisco(discoId, listaFaixas);
            }

            res.redirect('/discos');
        } catch (err) {
            res.status(500).send('Erro ao criar disco');
        }
    });
};

const updateDisco = (req, res) => {
    const { id } = req.params;
    const { titulo, ano_lancamento, existingCapa } = req.body;
    const genero_id = req.body['genero_id[]'];
    const faixas = req.body['faixas[]'];
    const generos = Array.isArray(genero_id) ? genero_id : [];
    const listaFaixas = Array.isArray(faixas) ? faixas : [];
    const capa = req.file ? req.file.filename : req.body.existingCapa;

    discoModel.updateDisco(id, titulo, ano_lancamento, capa, generos, listaFaixas)
        .then(async () => {
            if (generos && generos.length > 0) {
                await discoModel.updateGenerosToDisco(id, generos);
            }

            if (listaFaixas && listaFaixas.length > 0) {
                await discoModel.updateFaixasToDisco(id, listaFaixas);
            }

            res.json({ success: true });
        })
        .catch(err => {
            console.error('Erro ao editar o disco:', err);
            res.status(500).json({ success: false, error: err.message });
        });
};

const deleteDisco = async (req, res) => {
    const { id } = req.params;

    try {
        await discoModel.deleteDisco(id);
        res.status(200).json({ message: 'Disco excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao excluir disco' });
    }
};

module.exports = {
    getDiscos,
    getFormDiscoCriacao,
    getFormDiscoEdicao,
    createDisco,
    updateDisco,
    deleteDisco
};
