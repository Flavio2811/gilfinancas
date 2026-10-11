const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
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

// Armazenar códigos de reset em memória (expira em 15 minutos)
const resetCodes = {};

// Conexão SQLite
const db = new sqlite3.Database(path.join(__dirname, 'app.db'), (err) => {
    if (err) {
        console.error("Erro ao abrir banco SQLite:", err.message);
    } else {
        console.log("✅ Conectado ao SQLite!");
    }
});

// Criar tabelas
function setupDatabase() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                phone TEXT,
                email_recuperacao1 TEXT,
                email_recuperacao2 TEXT,
                phone_recuperacao TEXT,
                whatsapp_recuperacao TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error("Erro ao criar tabela usuarios:", err.message);
            else console.log("✅ Tabela usuarios OK");
        });

        db.run(`
            CREATE TABLE IF NOT EXISTS clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                nome TEXT NOT NULL,
                email TEXT,
                telefone TEXT,
                cpf_cnpj TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `, (err) => {
            if (err) console.error("Erro ao criar tabela clientes:", err.message);
            else console.log("✅ Tabela clientes OK");
        });

        db.run(`
            CREATE TABLE IF NOT EXISTS emprestimos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                cliente_id INTEGER NOT NULL,
                valor REAL NOT NULL,
                taxa_juros REAL,
                tipo_juros TEXT,
                data_vencimento DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                FOREIGN KEY (cliente_id) REFERENCES clientes(id)
            )
        `, (err) => {
            if (err) console.error("Erro ao criar tabela emprestimos:", err.message);
            else console.log("✅ Tabela emprestimos OK");
        });

        db.run(`
            CREATE TABLE IF NOT EXISTS pagamentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                emprestimo_id INTEGER NOT NULL,
                valor REAL NOT NULL,
                data_pagamento DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                FOREIGN KEY (emprestimo_id) REFERENCES emprestimos(id)
            )
        `, (err) => {
            if (err) console.error("Erro ao criar tabela pagamentos:", err.message);
            else console.log("✅ Tabela pagamentos OK");
        });
    });
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

        db.get("SELECT COUNT(*) as count FROM usuarios", (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const userCount = row.count;
            if (userCount >= 2) {
                return res.status(400).json({ error: "Registro fechado! O sistema está limitado a 2 contas e ambas já foram criadas." });
            }

            db.get("SELECT id FROM usuarios WHERE email = ?", [email], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (row) {
                    return res.status(400).json({ error: "Email já registrado" });
                }

                const passwordHash = bcryptjs.hashSync(password, 8);
                db.run(
                    "INSERT INTO usuarios (email, password_hash, name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [email, passwordHash, name, phone || null, email_recuperacao1 || null, email_recuperacao2 || null, phone_recuperacao || null, whatsapp_recuperacao || null],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        const token = generateToken(this.lastID);
                        console.log(`✅ Novo usuário registrado: ${email} (${userCount + 1}/2)`);
                        res.status(201).json({ message: "Usuário registrado com sucesso", token, user: { id: this.lastID, email: email, name: name } });
                    }
                );
            });
        });
    } catch (error) {
        console.error("Erro no registro:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        db.get("SELECT id, email, name, password_hash FROM usuarios WHERE email = ?", [email], (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(401).json({ error: "Email ou senha incorretos" });
            }

            const validPassword = bcryptjs.compareSync(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: "Email ou senha incorretos" });
            }

            const token = generateToken(user.id);
            res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
        });
    } catch (error) {
        console.error("Erro no login:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post("/auth/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        db.get("SELECT id, name, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao FROM usuarios WHERE email = ?", [email], (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(400).json({ error: "Email não encontrado" });
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString();

            resetCodes[email] = {
                code: code,
                expiresAt: Date.now() + 15 * 60 * 1000
            };

            console.log(`📧 Código de recuperação para ${email}: ${code}`);
            console.log(`📌 Emails de recuperação: ${user.email_recuperacao1 || "N/A"}, ${user.email_recuperacao2 || "N/A"}`);
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
        db.run("UPDATE usuarios SET password_hash = ? WHERE email = ?", [passwordHash, email], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            delete resetCodes[email];
            console.log(`✅ Senha resetada para ${email}`);
            res.json({ message: "Senha resetada com sucesso" });
        });
    } catch (error) {
        console.error("Erro ao resetar senha:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get("/dashboard", verifyToken, async (req, res) => {
    try {
        db.get("SELECT COUNT(*) as count FROM clientes WHERE usuario_id = ?", [req.userId], (err, clientes) => {
            if (err) return res.status(500).json({ error: err.message });

            db.get("SELECT COALESCE(SUM(valor), 0) as total FROM emprestimos WHERE usuario_id = ?", [req.userId], (err, emprestimos) => {
                if (err) return res.status(500).json({ error: err.message });

                db.get("SELECT COALESCE(SUM(valor), 0) as total FROM pagamentos WHERE usuario_id = ?", [req.userId], (err, pagamentos) => {
                    if (err) return res.status(500).json({ error: err.message });

                    res.json({
                        totalClientes: clientes.count,
                        capitalEmprestado: parseFloat(emprestimos.total || 0),
                        totalRecebido: parseFloat(pagamentos.total || 0)
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/clients", verifyToken, async (req, res) => {
    try {
        db.all("SELECT * FROM clientes WHERE usuario_id = ? ORDER BY created_at DESC", [req.userId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/clients", verifyToken, async (req, res) => {
    try {
        const { nome, email, telefone, cpf_cnpj } = req.body;
        db.run(
            "INSERT INTO clientes (usuario_id, nome, email, telefone, cpf_cnpj) VALUES (?, ?, ?, ?, ?)",
            [req.userId, nome, email, telefone, cpf_cnpj],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ id: this.lastID, nome, email, telefone, cpf_cnpj });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/loans", verifyToken, async (req, res) => {
    try {
        db.all("SELECT * FROM emprestimos WHERE usuario_id = ? ORDER BY created_at DESC", [req.userId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/loans", verifyToken, async (req, res) => {
    try {
        const { cliente_id, valor, taxa_juros, tipo_juros, data_vencimento } = req.body;
        db.run(
            "INSERT INTO emprestimos (usuario_id, cliente_id, valor, taxa_juros, tipo_juros, data_vencimento) VALUES (?, ?, ?, ?, ?, ?)",
            [req.userId, cliente_id, valor, taxa_juros, tipo_juros, data_vencimento],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ id: this.lastID, cliente_id, valor, taxa_juros, tipo_juros, data_vencimento });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/payments", verifyToken, async (req, res) => {
    try {
        db.all("SELECT * FROM pagamentos WHERE usuario_id = ? ORDER BY data_pagamento DESC", [req.userId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/payments", verifyToken, async (req, res) => {
    try {
        const { emprestimo_id, valor, data_pagamento } = req.body;
        db.run(
            "INSERT INTO pagamentos (usuario_id, emprestimo_id, valor, data_pagamento) VALUES (?, ?, ?, ?)",
            [req.userId, emprestimo_id, valor, data_pagamento],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ id: this.lastID, emprestimo_id, valor, data_pagamento });
            }
        );
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
    res.json({ status: "OK", message: "Servidor rodando com SQLite!" });
});

app.listen(PORT, () => {
    console.log("");
    console.log("════════════════════════════════════════════════════════════");
    console.log("  🚀 GIL.FINANÇAS Backend (SQLite) rodando!");
    console.log(`     Servidor: http://localhost:${PORT}`);
    console.log("     Banco de dados: SQLite (Local)");
    console.log("════════════════════════════════════════════════════════════");
    console.log("");
});
