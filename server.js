const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Configurar tipos MIME corretos para arquivos estáticos
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.type('application/javascript');
    }
    next();
});

app.use(express.static(path.dirname(__filename)));

const JWT_SECRET = process.env.JWT_SECRET || "seu_secret_key_super_seguro_2026";

// Conexão PostgreSQL (Supabase)
const pool = new Pool({
    host: "rslhrihbvzoeilkmjbwh.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: process.env.SUPABASE_PASSWORD || "GhLkOpMn2024!",
    ssl: { rejectUnauthorized: false }
});

// Criar tabelas automaticamente
async function setupDatabase() {
    try {
        const client = await pool.connect();
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
        await client.query(sql);
        client.release();
        console.log("✅ Tabelas criadas/verificadas com sucesso!");
    } catch (error) {
        console.error("⚠️ Aviso ao criar tabelas:", error.message);
    }
}

setupDatabase();

function generateToken(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

async function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token não encontrado" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ error: "Token inválido" });
    }
}

app.post("/auth/register", async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        const client = await pool.connect();
        try {
            const checkUser = await client.query("SELECT id FROM usuarios WHERE email = $1", [email]);
            if (checkUser.rows.length > 0) {
                return res.status(400).json({ error: "Email já registrado" });
            }
            const passwordHash = bcryptjs.hashSync(password, 8);
            const result = await client.query(
                "INSERT INTO usuarios (email, password_hash, name, phone, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, name",
                [email, passwordHash, name, phone || null]
            );
            const newUser = result.rows[0];
            const token = generateToken(newUser.id);
            res.status(201).json({ message: "Usuário registrado com sucesso", token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Erro no registro:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const client = await pool.connect();
        try {
            const result = await client.query("SELECT id, email, name, password_hash FROM usuarios WHERE email = $1", [email]);
            if (result.rows.length === 0) {
                return res.status(401).json({ error: "Email ou senha incorretos" });
            }
            const user = result.rows[0];
            const validPassword = bcryptjs.compareSync(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: "Email ou senha incorretos" });
            }
            const token = generateToken(user.id);
            res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Erro no login:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get("/dashboard", verifyToken, async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const [clientes, emprestimos, pagamentos] = await Promise.all([
                client.query("SELECT COUNT(*) as count FROM clientes WHERE usuario_id = $1", [req.userId]),
                client.query("SELECT COALESCE(SUM(valor), 0) as total FROM emprestimos WHERE usuario_id = $1", [req.userId]),
                client.query("SELECT COALESCE(SUM(valor), 0) as total FROM pagamentos WHERE usuario_id = $1", [req.userId])
            ]);
            res.json({
                totalClientes: parseInt(clientes.rows[0].count),
                capitalEmprestado: parseFloat(emprestimos.rows[0].total || 0),
                totalRecebido: parseFloat(pagamentos.rows[0].total || 0)
            });
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/clients", verifyToken, async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query("SELECT * FROM clientes WHERE usuario_id = $1 ORDER BY created_at DESC", [req.userId]);
            res.json(result.rows);
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/clients", verifyToken, async (req, res) => {
    try {
        const { nome, email, telefone, cpf_cnpj } = req.body;
        const client = await pool.connect();
        try {
            const result = await client.query(
                "INSERT INTO clientes (usuario_id, nome, email, telefone, cpf_cnpj, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
                [req.userId, nome, email, telefone, cpf_cnpj]
            );
            res.status(201).json(result.rows[0]);
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/loans", verifyToken, async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query("SELECT * FROM emprestimos WHERE usuario_id = $1 ORDER BY created_at DESC", [req.userId]);
            res.json(result.rows);
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/loans", verifyToken, async (req, res) => {
    try {
        const { cliente_id, valor, taxa_juros, tipo_juros, data_vencimento } = req.body;
        const client = await pool.connect();
        try {
            const result = await client.query(
                "INSERT INTO emprestimos (usuario_id, cliente_id, valor, taxa_juros, tipo_juros, data_vencimento, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
                [req.userId, cliente_id, valor, taxa_juros, tipo_juros, data_vencimento]
            );
            res.status(201).json(result.rows[0]);
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/payments", verifyToken, async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query("SELECT * FROM pagamentos WHERE usuario_id = $1 ORDER BY data_pagamento DESC", [req.userId]);
            res.json(result.rows);
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/payments", verifyToken, async (req, res) => {
    try {
        const { emprestimo_id, valor, data_pagamento } = req.body;
        const client = await pool.connect();
        try {
            const result = await client.query(
                "INSERT INTO pagamentos (usuario_id, emprestimo_id, valor, data_pagamento, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
                [req.userId, emprestimo_id, valor, data_pagamento]
            );
            res.status(201).json(result.rows[0]);
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

let fileVersion = Date.now();
app.get("/file-version", (req, res) => {
    res.json({ version: fileVersion });
});
setInterval(() => { fileVersion = Date.now(); }, 2000);

app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Servidor rodando com Supabase!" });
});

app.listen(PORT, () => {
    console.log("");
    console.log("════════════════════════════════════════════════════════════");
    console.log("  🚀 GIL.FINANÇAS Backend (Supabase) rodando!");
    console.log(`     Servidor: http://localhost:${PORT}`);
    console.log("     Banco de dados: Supabase PostgreSQL");
    console.log("════════════════════════════════════════════════════════════");
    console.log("");
});
