const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: "rslhrihbvzoeilkmjbwh.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "GhLkOpMn2024!",
    ssl: { rejectUnauthorized: false }
});

const sql = `
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    cpf_cnpj VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emprestimos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    valor DECIMAL(10,2) NOT NULL,
    taxa_juros DECIMAL(5,2),
    tipo_juros VARCHAR(50),
    data_vencimento DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pagamentos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    emprestimo_id INTEGER NOT NULL REFERENCES emprestimos(id),
    valor DECIMAL(10,2) NOT NULL,
    data_pagamento DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
`;

async function setupDatabase() {
    try {
        console.log("🔄 Conectando ao Supabase...");
        const client = await pool.connect();
        console.log("✅ Conectado!");
        
        console.log("📝 Criando tabelas...");
        await client.query(sql);
        console.log("✅ Tabelas criadas com sucesso!");
        
        client.release();
        pool.end();
        process.exit(0);
    } catch (error) {
        console.error("❌ Erro:", error.message);
        process.exit(1);
    }
}

setupDatabase();
