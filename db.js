const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',       
    host: 'localhost',     
    database: 'catalogo_discos', 
    password: '753',        
    port: 5432,     
});

module.exports = pool;
