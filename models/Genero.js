class Genero {
    constructor(pool) {
        this.pool = pool;
    }

    getAllGeneros() {
        return new Promise((resolve, reject) => {
            this.pool.query('SELECT * FROM generos', (err, result) => {
                if (err) return reject(err);
                resolve(result.rows);
            });
        });
    }

    createGenero(nome) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO generos (nome) VALUES ($1)';
            const values = [nome];
            this.pool.query(query, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    async getGeneroById(id) {
        const query = 'SELECT * FROM generos WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    updateGenero(id, nome) {
        const query = 'UPDATE generos SET nome = $1 WHERE id = $2';
        return this.pool.query(query, [nome, id]);
    }

    deleteGenero(id) {
        const query = 'DELETE FROM generos WHERE id = $1';
        return this.pool.query(query, [id]);
    }
}

module.exports = Genero;
