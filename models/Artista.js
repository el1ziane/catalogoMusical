const pool = require('../db');
const Genero = require('../models/Genero');

class Artista {
    constructor(pool) {
        this.pool = pool;
    }
    async getAllDiscos() {
        const query = `SELECT d.id, d.titulo
            FROM discos d`;
        const result = await this.pool.query(query);
        return result.rows;
    }
    async getAllDiscosId(artistaId) {
        const query = `
            SELECT d.id, d.titulo
            FROM discos d
            WHERE d.artista_id = $1
        `;
        const result = await this.pool.query(query, [artistaId]);
        return result.rows;
    }

    async getAllArtistas() {
        const query = `
            SELECT 
                a.id AS artista_id,
                a.nome AS artista_nome,
                d.titulo AS disco_titulo,
                g.nome AS genero_nome
            FROM artistas a
            LEFT JOIN discos d ON a.id = d.artista_id
            LEFT JOIN disco_generos dg ON d.id = dg.disco_id
            LEFT JOIN generos g ON dg.genero_id = g.id
            LEFT JOIN artista_genero ag ON a.id = ag.artista_id 
            LEFT JOIN generos g2 ON ag.genero_id = g2.id 
            ORDER BY a.nome, d.titulo, g.nome;
        `;
        
        const result = await this.pool.query(query);
    
        const artistas = {};
        result.rows.forEach(row => {
            if (!artistas[row.artista_id]) {
                artistas[row.artista_id] = {
                    id: row.artista_id,
                    nome: row.artista_nome,
                    discos: [],
                    generos: new Set(),
                };
            }
    
            
            if (row.disco_titulo && !artistas[row.artista_id].discos.some(d => d.titulo === row.disco_titulo)) {
                artistas[row.artista_id].discos.push({
                    titulo: row.disco_titulo,
                });
            }
    
            // Adicionar gênero ao artista, levando em consideração tanto os gêneros dos discos quanto os gêneros diretos do artista
            if (row.genero_nome) {
                artistas[row.artista_id].generos.add(row.genero_nome);
            }
            if (row.genero_nome2) {  // Verifica se há um segundo tipo de gênero associado diretamente ao artista
                artistas[row.artista_id].generos.add(row.genero_nome2);
            }
        });
    
        // Converter Set para Array para os gêneros
        return Object.values(artistas).map(artista => ({
            ...artista,
            generos: Array.from(artista.generos),
        }));
    }
    
    

    async getAllGeneros() {
        const query = 'SELECT * FROM generos';
        const result = await this.pool.query(query);
        return result.rows;
    }

    async getArtistaById(id) {
        const query = `
            SELECT a.*, d.id AS disco_id, d.titulo AS disco_titulo, d.ano_lancamento AS disco_ano, d.capa AS disco_capa, g.id AS genero_id, g.nome AS genero_nome
            FROM artistas a
            LEFT JOIN discos d ON d.artista_id = a.id
            LEFT JOIN disco_generos dg ON d.id = dg.disco_id
            LEFT JOIN generos g ON dg.genero_id = g.id
            WHERE a.id = $1
        `;
        const result = await this.pool.query(query, [id]);
    
        const artista = result.rows[0];
        if (artista) {
            artista.discos = result.rows.map(row => ({
                id: row.disco_id,
                titulo: row.disco_titulo,
                ano_lancamento: row.disco_ano,
                capa: row.disco_capa,
            }));
            artista.generos = result.rows.map(row => ({
                id: row.genero_id,
                nome: row.genero_nome,
            })).filter(genero => genero.id);  
        }
        return artista;
    }
    

    async createArtista(nome, genero_ids = [], discoIds = []) {
        if (!nome || nome.trim() === '') {
            throw new Error('O campo nome é obrigatório.');
        }
    
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            // Caso tenha apenas um gênero e um disco, salvar diretamente na tabela artistas
            let genero_id = null;
            let disco_id = null;
    
            if (genero_ids.length === 1) {
                genero_id = genero_ids[0]; // Armazenar o primeiro gênero na tabela artistas
            }
    
            if (discoIds.length === 1) {
                disco_id = discoIds[0]; // Armazenar o primeiro disco na tabela artistas
            }
    
            // Criar o artista na tabela artistas
            const queryArtista = 'INSERT INTO artistas (nome, genero_id, disco_id) VALUES ($1, $2, $3) RETURNING id';
            const result = await client.query(queryArtista, [nome, genero_id, disco_id]);
            const artistaId = result.rows[0].id;
    
            console.log(`Artista criado com ID: ${artistaId}`);
            
            // Se houver mais de um gênero ou disco, adicionar na tabela de relacionamento
            if (genero_ids.length > 1) {
                await this.addGenerosToArtista(client, artistaId, genero_ids);
            }
    
            if (discoIds.length > 1) {
                await this.addDiscosToArtista(client, artistaId, discoIds);
            }
    
            await client.query('COMMIT');
            return artistaId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    
    

    async updateArtista(id, nome, genero_ids = [], discoIds = []) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const queryArtista = 'UPDATE artistas SET nome = $1 WHERE id = $2';
            await client.query(queryArtista, [nome, id]);
            await this.updateGenerosToArtista(client, id, genero_ids);
            await this.updateDiscosToArtista(client, id, discoIds);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async addGenerosToArtista(client, artistaId, genero_ids) {
        if (!Array.isArray(genero_ids) || genero_ids.length === 0) {
            console.log('Nenhum gênero para adicionar.');
            return;
        }
    
        console.log(`Adicionando gêneros para o artista ${artistaId}: ${genero_ids}`);
    
        for (const generoId of genero_ids) {
            await client.query(
                'INSERT INTO artista_genero (artista_id, genero_id) VALUES ($1, $2)',
                [artistaId, generoId]
            );
        }
    }
    
    async addDiscosToArtista(client, artistaId, discoIds) {
        if (!Array.isArray(discoIds) || discoIds.length === 0) {
            console.log('Nenhum disco para adicionar.');
            return;
        }
    
        console.log(`Adicionando discos para o artista ${artistaId}: ${discoIds}`);
    
        for (const discoId of discoIds) {
            const query = `
                UPDATE discos 
                SET artista_id = $1 
                WHERE id = $2
            `;
            await client.query(query, [artistaId, discoId]);
        }
    }
    
    
    async updateGenerosToArtista(client, artistaId, genero_ids) {
        await client.query('DELETE FROM artista_genero WHERE artista_id = $1', [artistaId]);
        await this.addGenerosToArtista(client, artistaId, genero_ids);
    }

    // Dentro de 'Artista' model
async updateDiscoToArtista(artistaId, discoId) {
    const query = `
        UPDATE discos 
        SET artista_id = $1 
        WHERE id = $2
    `;
    await this.pool.query(query, [artistaId, discoId]);
}


    async getGenerosByArtistaId(artistaId) {
        const query = `
            SELECT g.* 
            FROM generos g
            JOIN artista_genero ag ON g.id = ag.genero_id
            WHERE ag.artista_id = $1
        `;
        const result = await this.pool.query(query, [artistaId]);
        return result.rows;
    }

    async deleteArtista(id) {
        const query = 'DELETE FROM artistas WHERE id = $1';
        return this.pool.query(query, [id]);
    }
}

module.exports = Artista;
