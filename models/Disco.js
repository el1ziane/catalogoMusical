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
        const queryDelete = 'DELETE FROM disco_generos WHERE disco_id = $1';
        await this.pool.query(queryDelete, [discoId]);
    
        for (const generoId of generos) {
            const queryInsert = 'INSERT INTO disco_generos (disco_id, genero_id) VALUES ($1, $2)';
            await this.pool.query(queryInsert, [discoId, generoId]);
        }
    }
    
    async updateFaixasToDisco(discoId, faixas) {
        const queryDelete = 'DELETE FROM faixas WHERE disco_id = $1';
        await this.pool.query(queryDelete, [discoId]);
    
        for (const nomeFaixa of faixas) {
            const queryInsert = 'INSERT INTO faixas (nome, disco_id) VALUES ($1, $2)';
            await this.pool.query(queryInsert, [nomeFaixa, discoId]);
        }
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
                array_agg(DISTINCT generos.nome) AS generos, 
                array_agg(DISTINCT faixas.nome) AS faixas
            FROM discos
            LEFT JOIN disco_generos ON discos.id = disco_generos.disco_id
            LEFT JOIN generos ON disco_generos.genero_id = generos.id
            LEFT JOIN faixas ON discos.id = faixas.disco_id
            GROUP BY discos.id
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

    async createDisco(titulo, ano_lancamento, capa, generos, faixas) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const queryDisco = `
                INSERT INTO discos (titulo, ano_lancamento, capa)
                VALUES ($1, $2, $3) RETURNING id`;
            const result = await client.query(queryDisco, [titulo, ano_lancamento, capa]);
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

    async updateDisco(id, titulo, ano_lancamento, capa, generos, faixas) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            const query = 'UPDATE discos SET titulo = $1, ano_lancamento = $2, capa = $3 WHERE id = $4';
            await client.query(query, [titulo, ano_lancamento, capa, id]);
    
            if (Array.isArray(generos) && generos.length > 0) {
                await this.updateGenerosToDisco(id, generos);
            } else {
                await this.updateGenerosToDisco(id, []);
            }
    
            if (Array.isArray(faixas) && faixas.length > 0) {
                await this.updateFaixasToDisco(id, faixas);
            } else {
                await this.updateFaixasToDisco(id, []);
            }
    
            await client.query('COMMIT');
            return { success: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteDisco(id) {
        const query = 'DELETE FROM discos WHERE id = $1';
        return this.pool.query(query, [id]);
    }
}

module.exports = Disco;
