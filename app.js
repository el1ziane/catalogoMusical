const express = require('express');
const path = require('path');
const pool = require('./db');
const artistaRoutes = require('./routes/artistas');
const discoRoutes = require('./routes/discos');
const generoRoutes = require('./routes/genero');
const methodOverride = require('method-override');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, '/public/', 'css')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css'), {
    setHeaders: (res, path, stat) => {
        res.set('Content-Type', 'text/css');
    }
}));

app.use('/', discoRoutes);
app.use('/', artistaRoutes);
app.use('/', generoRoutes);

app.get('/', (req, res) => {
    pool.query('SELECT discos.titulo, discos.ano_lancamento, discos.capa, artistas.nome AS artista FROM discos JOIN artistas ON discos.artista_id = artistas.id', (err, result) => {
        if (err) {
            console.error('Erro ao consultar os discos:', err.message);
            return res.status(500).send('Erro ao carregar discos');
        }

        const discos = result.rows || [];
        res.render('index', { discos });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
