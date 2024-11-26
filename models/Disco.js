const pool = require('../db');
const Genero = require('../models/Genero');

class Disco {
    constructor(pool) {
        this.pool = pool;
    }

    async getGenerosByDiscoId(discoId) {
        const query = `
            SELECT g.*
            FROM generos g
            JOIN disco_generos dg ON g.id = dg.genero_id
            WHERE dg.disco_id = $1
        `;
        const result = await this.pool.query(query, [discoId]);
        return result.rows;
    }

    async addGenerosToDisco(client, discoId, generos) {
        if (!Array.isArray(generos) || generos.length === 0) {
            return;
        }

        for (const generoId of generos) {
            await client.query(
                'INSERT INTO disco_generos (disco_id, genero_id) VALUES ($1, $2)',
                [discoId, generoId]
            );
        }
    }

    async addFaixasToDisco(client, discoId, faixas) {
        if (!Array.isArray(faixas) || faixas.length === 0) {
            return;
        }

        for (const nomeFaixa of faixas) {
            await client.query(
                'INSERT INTO faixas (nome, disco_id) VALUES ($1, $2)',
                [nomeFaixa, discoId]
            );
        }
    }

    async getAllGeneros() {
        const query = 'SELECT * FROM generos';
        const result = await this.pool.query(query);
        return result.rows;
    }

    async updateGenerosToDisco(discoId, generos) {
        await this.pool.query('DELETE FROM disco_generos WHERE disco_id = $1', [discoId]);
        await this.addGenerosToDisco(discoId, generos);
    }

    async updateFaixasToDisco(discoId, faixas) {
        await this.pool.query('DELETE FROM faixas WHERE disco_id = $1', [discoId]);
        await this.addFaixasToDisco(discoId, faixas);
    }

    async getAllArtistas() {
        const query = 'SELECT * FROM artistas';
        const result = await this.pool.query(query);
        return result.rows;
    }

    async getDiscoById(id) {
        const query = 'SELECT * FROM discos WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    async getAllDiscos() {
        const query = `
            SELECT 
                discos.id, 
                discos.titulo, 
                discos.capa, 
                discos.artista_id, 
                artistas.nome AS artista_nome,
                array_agg(DISTINCT generos.nome) AS generos, 
                array_agg(DISTINCT faixas.nome) AS faixas
            FROM discos
            LEFT JOIN artistas ON discos.artista_id = artistas.id
            LEFT JOIN disco_generos ON discos.id = disco_generos.disco_id
            LEFT JOIN generos ON disco_generos.genero_id = generos.id
            LEFT JOIN faixas ON discos.id = faixas.disco_id
            GROUP BY discos.id, artistas.nome
        `;
        const result = await this.pool.query(query);
        return result.rows.map(row => ({
            ...row,
            generos: row.generos || [],
            faixas: row.faixas || [],
        }));
    }

    async getFaixasByDiscoId(discoId) {
        const query = 'SELECT * FROM faixas WHERE disco_id = $1';
        const result = await this.pool.query(query, [discoId]);
        return result.rows;
    }

    async createDisco(titulo, artista_id, ano_lancamento, capa, generos, faixas) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const queryDisco = `
                INSERT INTO discos (titulo, artista_id, ano_lancamento, capa)
                VALUES ($1, $2, $3, $4) RETURNING id`;
            const result = await client.query(queryDisco, [titulo, artista_id, ano_lancamento, capa]);
            const discoId = result.rows[0].id;

            await this.addGenerosToDisco(client, discoId, generos);
            await this.addFaixasToDisco(client, discoId, faixas);

            await client.query('COMMIT');
            return discoId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateDisco(id, titulo, artista_id, ano_lancamento, capa, generos, faixas) {
        if (!titulo || titulo.trim() === '') {
            throw new Error('Título não pode ser vazio.');
        }
    
        const query = 'UPDATE discos SET titulo = $1, artista_id = $2, ano_lancamento = $3, capa = $4 WHERE id = $5';
        await this.pool.query(query, [titulo, artista_id, ano_lancamento, capa, id]);
    
        // Atualiza os gêneros e as faixas
        if (generos && generos.length > 0) {
            await this.updateGenerosToDisco(id, generos);
        }
    
        if (faixas && faixas.length > 0) {
            await this.updateFaixasToDisco(id, faixas);
        }
    }
    

    async deleteDisco(id) {
        const query = 'DELETE FROM discos WHERE id = $1';
        return this.pool.query(query, [id]);
    }
}

module.exports = Disco;
