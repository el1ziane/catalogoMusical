const Artista = require('../models/Artista');
const pool = require('../db');
const artistaModel = new Artista(pool);

const getArtistas = (req, res) => {
    artistaModel.getAllArtistas()
        .then(artistas => {
            console.log('Artistas carregados:', artistas);
            res.render('artistas', { artistas });
        })
        .catch(err => {
            console.error('Erro ao carregar artistas:', err); 
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
    try {
        const artistaId = req.params.id;
        const artista = await artistaModel.getArtistaById(artistaId); 
        const generos = await artistaModel.getAllGeneros(); 
        const discos = await artistaModel.getAllDiscos();
        const generosSelecionados = artista.genero_id || [];
        const discosSelecionados = artista.disco_id || []; 

        console.log('Artista:', artista);
        console.log('Generos Selecionados:', generosSelecionados);
        console.log('Discos Selecionados:', discosSelecionados);
        res.render('formArtistaEdit', {
            artista,
            generos,            
            generosSelecionados,
            discos,              
            discosSelecionados  
        });

    } catch (err) {
        console.error('Erro ao carregar dados do formulário:', err.message);
        res.status(500).send('Erro ao carregar dados do formulário');
    }
};



const createArtista = async (req, res) => {
    const { nome, genero_id, disco } = req.body;
console.log(nome, genero_id, disco);
console.log('Nome:', nome);
console.log('Gêneros:', genero_id);
console.log('Discos:', disco);

    try {
        await artistaModel.createArtista(nome, genero_id, disco);
        res.redirect('/artistas');
    } catch (err) {
        console.error('Erro ao criar artista:', err.message);
        res.status(500).send('Erro ao criar artista');
    }
};

const updateArtista = async (req, res) => {
    const { id } = req.params;
    const { nome, genero_id, disco_id } = req.body;

    try {
        await artistaModel.updateArtista(id, nome, genero_id, disco_id);
        res.redirect('/artistas');
    } catch (err) {
        
        res.status(500).send('Erro ao atualizar artista');
    }
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
