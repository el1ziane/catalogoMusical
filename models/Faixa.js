class Faixa {
    constructor(db) {
        this.db = db;
    }

    async listarFaixasPorDisco(discoId) {
        const { rows } = await this.db.query(
            `SELECT * FROM faixas WHERE disco_id = $1`,
            [discoId]
        );
        return rows;
    }

    async criarFaixa({ nome, discoId }) {
        const { rows } = await this.db.query(
            `INSERT INTO faixas (nome, disco_id)
             VALUES ($1, $2)
             RETURNING *`,
            [nome, discoId]
        );
        return rows[0];
    }

    async removerFaixa(id) {
        const { rowCount } = await this.db.query(`DELETE FROM faixas WHERE id = $1`, [id]);
        return rowCount > 0;
    }
}

module.exports = Faixa;
