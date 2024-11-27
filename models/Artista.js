class Artista {
    constructor(pool) {
        this.pool = pool;
    }

    async getAllArtistas() {
        const query = `
            SELECT 
                a.id AS artista_id,
                a.nome AS artista_nome,
                ARRAY(SELECT d.titulo FROM discos d WHERE d.id = ANY(a.disco_id)) AS discos,
                ARRAY(SELECT g.nome FROM generos g WHERE g.id = ANY(a.genero_id)) AS generos
            FROM artistas a
            ORDER BY a.nome;
        `;
        const result = await this.pool.query(query);
    
        return result.rows.map(row => ({
            id: row.artista_id,
            nome: row.artista_nome,
            discos: row.discos || [],
            generos: row.generos || [],
        }));
    }

    async createArtista(nome, genero_id, disco_id) {
        if (!nome || !genero_id || !disco_id) {
            throw new Error('Nome, gênero e disco são obrigatórios.');
        }

        const query = `
            INSERT INTO artistas (nome, genero_id, disco_id)
            VALUES ($1, $2, $3)
            RETURNING id;
        `;
        const result = await this.pool.query(query, [nome, genero_id, disco_id]);
        return result.rows[0].id;
    }

    async updateArtista(id, nome, genero_id, disco_id) {
        const query = `
            UPDATE artistas 
            SET nome = $1, genero_id = $2, disco_id = $3
            WHERE id = $4;
        `;
        await this.pool.query(query, [nome, genero_id, disco_id, id]);
    }

    async getArtistaById(id) {
        const query = `
            SELECT 
                a.id AS artista_id, 
                a.nome AS artista_nome, 
                a.genero_id,
                a.disco_id,
                ARRAY(SELECT d.titulo FROM discos d WHERE d.id = ANY(a.disco_id)) AS discos,
                ARRAY(SELECT g.nome FROM generos g WHERE g.id = ANY(a.genero_id)) AS generos
            FROM artistas a
            WHERE a.id = $1;
        `;
        
        const result = await this.pool.query(query, [id]);
    
        if (result.rows.length === 0) {
            return null;
        }
    
        const row = result.rows[0];
    
        return {
            id: row.artista_id,
            nome: row.artista_nome,
            genero_id: row.genero_id,
            disco_id: row.disco_id,
            discos: row.discos || [],
            generos: row.generos || [],
        };
    }
    

    async getAllDiscos() {
        const query = `SELECT id, titulo FROM discos;`;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async getAllGeneros() {
        const query = `SELECT id, nome FROM generos;`;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async deleteArtista(id) {
        const query = `DELETE FROM artistas WHERE id = $1;`;
        await this.pool.query(query, [id]);
    }
}

module.exports = Artista;
