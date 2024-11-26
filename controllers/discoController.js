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
        const artistas = await discoModel.getAllArtistas();
        const generos = await discoModel.getAllGeneros();
        res.render('formDisco', { 
            artistas, 
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
        const artistas = await discoModel.getAllArtistas();
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
            artistas, 
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

        const { titulo, ano_lancamento, artista_id, genero_id, faixas } = req.body;
        let generos = Array.isArray(genero_id) ? genero_id : [genero_id];
        generos = generos.filter(genero_id => genero_id && typeof genero_id === 'string' && genero_id.trim() !== '');

        if (!generos || generos.length === 0) {
            return res.status(400).send('O campo "gêneros" deve ser um array não vazio.');
        }

        const capa = req.file ? req.file.filename : null;
        let listaFaixas = Array.isArray(faixas) ? faixas : [faixas];
        listaFaixas = listaFaixas.filter(faixa => faixa && faixa.trim() !== '');

        try {
            const discoId = await discoModel.createDisco(titulo, artista_id, ano_lancamento, capa, generos, listaFaixas);

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
    const titulo = req.body.titulo;
    const ano_lancamento = req.body.ano_lancamento;
    const artista_id = req.body.artista_id;
    const generos = req.body.genero_id;
    const faixas = req.body.faixas;

    if (!titulo || titulo.trim() === '') {
        return res.status(400).send('O título é obrigatório');
    }

    const capa = req.file ? req.file.filename : req.body.existingCapa;

    discoModel.updateDisco(id, titulo, artista_id, ano_lancamento, capa, generos, faixas)  
        .then(async () => {
            if (generos && generos.length > 0) {
                await discoModel.updateGenerosToDisco(id, generos);
            }

            if (faixas && faixas.length > 0) {
                await discoModel.updateFaixasToDisco(id, faixas);
            }

            res.json({ success: true });
        })
        .catch(err => {
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
