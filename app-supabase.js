const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { Client } = require("pg");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Servir app-expanded.html na raiz
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "app-expanded.html"));
});

app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.type('application/javascript');
    }
    next();
});

app.use(express.static(path.dirname(__filename)));

const JWT_SECRET = process.env.JWT_SECRET || "seu_secret_key_super_seguro_2026";

// Configurar pool de conexões PostgreSQL
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Conectar com retry
let retryCount = 0;
const MAX_RETRIES = 5;

async function connectDB() {
    try {
        if (!client._connected) {
            await client.connect();
            console.log("✅ Conectado ao Supabase PostgreSQL!");
        }
    } catch (err) {
        console.error(`❌ Erro de conexão (tentativa ${retryCount + 1}/${MAX_RETRIES}):`, err.message);
        retryCount++;
        if (retryCount < MAX_RETRIES) {
            setTimeout(connectDB, 2000 * retryCount);
        }
    }
}

connectDB();

// Armazenar códigos de reset em memória (expira em 15 minutos)
const resetCodes = {};

async function query(text, params = []) {
    try {
        const result = await client.query(text, params);
        return result.rows;
    } catch (err) {
        console.error("Erro na query:", err.message);
        throw err;
    }
}

async function queryOne(text, params = []) {
    const rows = await query(text, params);
    return rows[0];
}

// Criar tabelas se não existirem
async function setupDatabase() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                phone TEXT,
                email_recuperacao1 TEXT,
                email_recuperacao2 TEXT,
                phone_recuperacao TEXT,
                whatsapp_recuperacao TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Tabela usuarios OK");

        await query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
                nome TEXT NOT NULL,
                email TEXT,
                telefone TEXT,
                cpf_cnpj TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Tabela clientes OK");

        await query(`
            CREATE TABLE IF NOT EXISTS emprestimos (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
                cliente_id INTEGER NOT NULL REFERENCES clientes(id),
                valor DECIMAL(15,2),
                taxa_juros DECIMAL(5,2),
                tipo_juros TEXT,
                data_vencimento DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Tabela emprestimos OK");

        await query(`
            CREATE TABLE IF NOT EXISTS pagamentos (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
                emprestimo_id INTEGER NOT NULL REFERENCES emprestimos(id),
                valor DECIMAL(15,2),
                data_pagamento DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Tabela pagamentos OK");
    } catch (err) {
        console.error("Erro ao criar tabelas:", err.message);
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
        const { email, password, name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao } = req.body;

        const countResult = await query("SELECT COUNT(*) as count FROM usuarios");
        const userCount = parseInt(countResult[0].count);

        if (userCount >= 2) {
            return res.status(400).json({ error: "Registro fechado! O sistema está limitado a 2 contas e ambas já foram criadas." });
        }

        const existing = await queryOne("SELECT id FROM usuarios WHERE email = ?", [email]);
        if (existing) {
            return res.status(400).json({ error: "Email já registrado" });
        }

        const passwordHash = bcryptjs.hashSync(password, 8);
        const result = await query(
            "INSERT INTO usuarios (email, password_hash, name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
            [email, passwordHash, name, phone || null, email_recuperacao1 || null, email_recuperacao2 || null, phone_recuperacao || null, whatsapp_recuperacao || null]
        );

        const userId = result[0].id;
        const token = generateToken(userId);
        console.log(`✅ Novo usuário registrado: ${email} (${userCount + 1}/2)`);
        res.status(201).json({ message: "Usuário registrado com sucesso", token, user: { id: userId, email: email, name: name } });
    } catch (error) {
        console.error("Erro no registro:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await queryOne("SELECT id, email, name, password_hash FROM usuarios WHERE email = $1", [email]);

        if (!user) {
            return res.status(401).json({ error: "Email ou senha incorretos" });
        }

        const validPassword = bcryptjs.compareSync(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: "Email ou senha incorretos" });
        }

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error("Erro no login:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post("/auth/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await queryOne("SELECT id, name, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao FROM usuarios WHERE email = $1", [email]);

        if (!user) {
            return res.status(400).json({ error: "Email não encontrado" });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        resetCodes[email] = {
            code: code,
            expiresAt: Date.now() + 15 * 60 * 1000
        };

        console.log(`📧 Código de recuperação para ${email}: ${code}`);
        console.log(`📌 Emails: ${user.email_recuperacao1 || "N/A"}, ${user.email_recuperacao2 || "N/A"}`);
        console.log(`📱 Telefone: ${user.phone_recuperacao || "N/A"}`);
        console.log(`💬 WhatsApp: ${user.whatsapp_recuperacao || "N/A"}`);

        res.json({
            message: "Código enviado",
            recoveryContacts: {
                email1: user.email_recuperacao1 ? "✓ " + user.email_recuperacao1.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
                email2: user.email_recuperacao2 ? "✓ " + user.email_recuperacao2.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
                phone: user.phone_recuperacao ? "✓ " + user.phone_recuperacao.replace(/(.{2})(.*)(.{2})/, '$1***$3') : null,
                whatsapp: user.whatsapp_recuperacao ? "✓ " + user.whatsapp_recuperacao.replace(/(.{2})(.*)(.{2})/, '$1***$3') : null
            }
        });
    } catch (error) {
        console.error("Erro ao solicitar recuperação:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post("/auth/reset-password", async (req, res) => {
    try {
        const { email, code, password } = req.body;

        if (!resetCodes[email]) {
            return res.status(400).json({ error: "Solicite um novo código de recuperação" });
        }

        const resetData = resetCodes[email];
        if (Date.now() > resetData.expiresAt) {
            delete resetCodes[email];
            return res.status(400).json({ error: "Código expirado. Solicite um novo." });
        }

        if (resetData.code !== code) {
            return res.status(400).json({ error: "Código inválido" });
        }

        const passwordHash = bcryptjs.hashSync(password, 8);
        await query("UPDATE usuarios SET password_hash = $1 WHERE email = $2", [passwordHash, email]);

        delete resetCodes[email];
        console.log(`✅ Senha resetada para ${email}`);
        res.json({ message: "Senha resetada com sucesso" });
    } catch (error) {
        console.error("Erro ao resetar senha:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get("/dashboard", verifyToken, async (req, res) => {
    try {
        const clientes = await queryOne("SELECT COUNT(*) as count FROM clientes WHERE usuario_id = $1", [req.userId]);
        const emprestimos = await queryOne("SELECT COALESCE(SUM(valor), 0) as total FROM emprestimos WHERE usuario_id = $1", [req.userId]);
        const pagamentos = await queryOne("SELECT COALESCE(SUM(valor), 0) as total FROM pagamentos WHERE usuario_id = $1", [req.userId]);

        res.json({
            totalClientes: parseInt(clientes.count),
            capitalEmprestado: parseFloat(emprestimos.total || 0),
            totalRecebido: parseFloat(pagamentos.total || 0)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/clients", verifyToken, async (req, res) => {
    try {
        const rows = await query("SELECT * FROM clientes WHERE usuario_id = $1 ORDER BY created_at DESC", [req.userId]);
        res.json(rows || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/clients", verifyToken, async (req, res) => {
    try {
        const { nome, email, telefone, cpf_cnpj } = req.body;
        const result = await query(
            "INSERT INTO clientes (usuario_id, nome, email, telefone, cpf_cnpj) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [req.userId, nome, email, telefone, cpf_cnpj]
        );
        res.status(201).json({ id: result[0].id, nome, email, telefone, cpf_cnpj });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/loans", verifyToken, async (req, res) => {
    try {
        const rows = await query("SELECT * FROM emprestimos WHERE usuario_id = $1 ORDER BY created_at DESC", [req.userId]);
        res.json(rows || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/loans", verifyToken, async (req, res) => {
    try {
        const { cliente_id, valor, taxa_juros, tipo_juros, data_vencimento } = req.body;
        const result = await query(
            "INSERT INTO emprestimos (usuario_id, cliente_id, valor, taxa_juros, tipo_juros, data_vencimento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [req.userId, cliente_id, valor, taxa_juros, tipo_juros, data_vencimento]
        );
        res.status(201).json({ id: result[0].id, cliente_id, valor, taxa_juros, tipo_juros, data_vencimento });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/payments", verifyToken, async (req, res) => {
    try {
        const rows = await query("SELECT * FROM pagamentos WHERE usuario_id = $1 ORDER BY data_pagamento DESC", [req.userId]);
        res.json(rows || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/payments", verifyToken, async (req, res) => {
    try {
        const { emprestimo_id, valor, data_pagamento } = req.body;
        const result = await query(
            "INSERT INTO pagamentos (usuario_id, emprestimo_id, valor, data_pagamento) VALUES ($1, $2, $3, $4) RETURNING id",
            [req.userId, emprestimo_id, valor, data_pagamento]
        );
        res.status(201).json({ id: result[0].id, emprestimo_id, valor, data_pagamento });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

let fileVersion = Date.now();
app.get("/file-version", (req, res) => {
    res.json({ version: fileVersion });
});

setInterval(() => { fileVersion = Date.now(); }, 2000);

app.get("/perfil", verifyToken, async (req, res) => {
    try {
        const user = await queryOne("SELECT id, email, name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao FROM usuarios WHERE id = $1", [req.userId]);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/perfil", verifyToken, async (req, res) => {
    try {
        const { name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao } = req.body;

        await query(
            "UPDATE usuarios SET name = $1, phone = $2, email_recuperacao1 = $3, email_recuperacao2 = $4, phone_recuperacao = $5, whatsapp_recuperacao = $6 WHERE id = $7",
            [name || null, phone || null, email_recuperacao1 || null, email_recuperacao2 || null, phone_recuperacao || null, whatsapp_recuperacao || null, req.userId]
        );

        res.json({ message: "Perfil atualizado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/perfil/senha", verifyToken, async (req, res) => {
    try {
        const { senhaAtual, senhaNova } = req.body;

        const user = await queryOne("SELECT password_hash FROM usuarios WHERE id = $1", [req.userId]);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        const validPassword = bcryptjs.compareSync(senhaAtual, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: "Senha atual incorreta" });
        }

        const passwordHash = bcryptjs.hashSync(senhaNova, 8);
        await query("UPDATE usuarios SET password_hash = $1 WHERE id = $2", [passwordHash, req.userId]);

        res.json({ message: "Senha atualizada com sucesso" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Servidor rodando com Supabase PostgreSQL!" });
});

app.listen(PORT, () => {
    console.log("");
    console.log("════════════════════════════════════════════════════════════");
    console.log("  🚀 GIL.FINANÇAS Backend (Supabase PostgreSQL) rodando!");
    console.log(`     Servidor: http://localhost:${PORT}`);
    console.log("════════════════════════════════════════════════════════════");
    console.log("");
});
