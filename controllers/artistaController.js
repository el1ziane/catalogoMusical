const Artista = require('../models/Artista');
const pool = require('../db');
const artistaModel = new Artista(pool);

const getArtistas = (req, res) => {
    artistaModel.getAllArtistas()
        .then(artistas => {
            res.render('artistas', { artistas });
        })
        .catch(err => {
            res.status(500).send('Erro ao carregar artistas');
        });
};

const getFormArtistaCriacao = async (req, res) => {
    try {
        const generos = await artistaModel.getAllGeneros();
        const discos = await artistaModel.getAllDiscos();  
        res.render('formArtista', { generos, discos, artista: {} });
    } catch (err) {
        console.error('Erro ao carregar dados do formulário:', err.message);
        res.status(500).send('Erro ao carregar dados do formulário');
    }
};



const getFormArtistaEdicao = async (req, res) => {
    const artistaId = req.params.id;

    try {
        const artista = await artistaModel.getArtistaById(artistaId);
        if (!artista) {
            return res.status(404).send('Artista não encontrado');
        }

        const generos = await artistaModel.getAllGeneros();
        const todosDiscos = await artistaModel.getAllDiscos();
        const discosSelecionados = artista.discos.map(disco => disco.id);
        const generosSelecionados = artista.generos ? artista.generos.map(genero => genero.id) : []; 

        res.render('formArtistaEdit', {
            artista,
            generos,
            todosDiscos,
            discosSelecionados,
            generosSelecionados, 
        });
    } catch (err) {
        console.error('Erro ao carregar dados do formulário:', err.message);
        res.status(500).send('Erro ao carregar dados do formulário');
    }
};



const createArtista = async (req, res) => {
    console.log('Dados recebidos no body:', req.body);  // Verifique se está tudo correto
    const { nome, genero_id, disco } = req.body;
    
    let generos = Array.isArray(genero_id) ? genero_id : [genero_id];
    generos = generos.filter(genero_id => genero_id && typeof genero_id === 'string' && genero_id.trim() !== '');
    
    let discos = Array.isArray(disco) ? disco : [disco];
    discos = discos.filter(disco => disco && typeof disco === 'string' && disco.trim() !== '');

    try {
        const artistaId = await artistaModel.createArtista(nome, generos, discos);

        if (generos && generos.length > 0) {
            await artistaModel.addGenerosToArtista(artistaId, generos);
        }

        if (discos && discos.length > 0) {
            await artistaModel.addDiscosToArtista(artistaId, discos);
        }

        res.redirect('/artistas');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao criar artista');
    }
};



const updateArtista = (req, res) => {
    const { id } = req.params;
    const nome= req.body.nome;
    const generos = req.body.genero_id;
    const disco = req.body.disco_id;

    artistaModel.updateArtista(id, nome, generos, disco)
        .then(async () => {
            if (generos && generos.length > 0) {
                await artistaModel.updateGenerosToArtista(id, generos);
            }

            if (disco) {
                await artistaModel.updateDiscoToArtista(id, disco);
            }

            res.json({ success: true });
        })
        .catch(err => {
            res.status(500).json({ success: false, error: err.message });
        });
};

const deleteArtista = async (req, res) => {
    const { id } = req.params;

    try {
        await artistaModel.deleteArtista(id);
        res.status(200).json({ message: 'Artista excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao excluir artista' });
    }
};

module.exports = {
    getArtistas,
    getFormArtistaCriacao,
    getFormArtistaEdicao,
    createArtista,
    updateArtista,
    deleteArtista
};
