const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "seu_secret_key_super_seguro_2026";
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "gilfinancas@2024").trim();
const ADMIN_EMAIL = "flavio.guerreiro.da.esperanca@gmail.com";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

let resetCodes = {};

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
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
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
        clientes JSONB DEFAULT '[]'::jsonb,
        emprestimos JSONB DEFAULT '[]'::jsonb,
        pagamentos JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_perfil TEXT`);

    const existing = await client.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [ADMIN_EMAIL]
    );
    if (existing.rows.length === 0) {
      await client.query(
        `INSERT INTO usuarios
          (email, password_hash, name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          ADMIN_EMAIL,
          bcryptjs.hashSync(ADMIN_PASSWORD, 8),
          "Flavio Guerreiro",
          "(11) 9 9999-8888",
          "flavio.recuperacao1@gmail.com",
          "flavio.recuperacao2@gmail.com",
          "(11) 98888-7777",
          "(11) 97777-6666"
        ]
      );
      console.log("Usuário admin criado no banco.");
    }

    console.log("Banco de dados inicializado com sucesso.");
  } catch (err) {
    console.error("Erro ao inicializar banco:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

initDB().catch((err) => {
  console.error("Falha fatal na inicialização do banco:", err.message);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.dirname(__filename)));

app.get("/", (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.sendFile(path.join(__dirname, "app-expanded.html"));
});

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(req, res, next) {
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

    const existing = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email já registrado" });
    }

    const result = await pool.query(
      `INSERT INTO usuarios (email, password_hash, name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, name`,
      [
        email,
        bcryptjs.hashSync(password, 8),
        name,
        phone || null,
        email_recuperacao1 || null,
        email_recuperacao2 || null,
        phone_recuperacao || null,
        whatsapp_recuperacao || null
      ]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);
    res.status(201).json({ message: "Usuário registrado com sucesso", token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !bcryptjs.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Email não encontrado" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes[email] = { code, expiresAt: Date.now() + 15 * 60 * 1000 };

    res.json({
      message: "Código enviado",
      testCode: code,
      recoveryContacts: {
        email1: user.email_recuperacao1 ? "✓ " + user.email_recuperacao1.replace(/(.{2})(.*)(@.*)/, "$1***$3") : null,
        email2: user.email_recuperacao2 ? "✓ " + user.email_recuperacao2.replace(/(.{2})(.*)(@.*)/, "$1***$3") : null,
        phone: user.phone_recuperacao ? "✓ " + user.phone_recuperacao.replace(/(.{2})(.*)(.{2})/, "$1***$3") : null,
        whatsapp: user.whatsapp_recuperacao ? "✓ " + user.whatsapp_recuperacao.replace(/(.{2})(.*)(.{2})/, "$1***$3") : null
      }
    });
  } catch (error) {
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

    await pool.query(
      "UPDATE usuarios SET password_hash = $1 WHERE email = $2",
      [bcryptjs.hashSync(password, 8), email]
    );
    delete resetCodes[email];
    res.json({ message: "Senha resetada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/perfil", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao, foto_perfil FROM usuarios WHERE id = $1",
      [req.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/perfil", verifyToken, async (req, res) => {
  try {
    const { name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao } = req.body;
    if ('foto_perfil' in req.body) {
      await pool.query(
        `UPDATE usuarios SET
          name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          email_recuperacao1 = COALESCE($3, email_recuperacao1),
          email_recuperacao2 = COALESCE($4, email_recuperacao2),
          phone_recuperacao = COALESCE($5, phone_recuperacao),
          whatsapp_recuperacao = COALESCE($6, whatsapp_recuperacao),
          foto_perfil = $7
         WHERE id = $8`,
        [name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao, req.body.foto_perfil || null, req.userId]
      );
    } else {
      await pool.query(
        `UPDATE usuarios SET
          name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          email_recuperacao1 = COALESCE($3, email_recuperacao1),
          email_recuperacao2 = COALESCE($4, email_recuperacao2),
          phone_recuperacao = COALESCE($5, phone_recuperacao),
          whatsapp_recuperacao = COALESCE($6, whatsapp_recuperacao)
         WHERE id = $7`,
        [name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao, req.userId]
      );
    }
    res.json({ message: "Perfil atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/perfil/senha", verifyToken, async (req, res) => {
  try {
    const { senhaAtual, senhaNova } = req.body;
    const result = await pool.query("SELECT password_hash FROM usuarios WHERE id = $1", [req.userId]);
    const user = result.rows[0];

    if (!user || !bcryptjs.compareSync(senhaAtual, user.password_hash)) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    await pool.query(
      "UPDATE usuarios SET password_hash = $1 WHERE id = $2",
      [bcryptjs.hashSync(senhaNova, 8), req.userId]
    );
    res.json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/clients", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT clientes FROM user_data WHERE user_id = $1", [req.userId]);
    res.json(result.rows[0]?.clientes || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/clients", verifyToken, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO user_data (user_id, clientes) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET clientes = $2, updated_at = NOW()`,
      [req.userId, JSON.stringify(req.body)]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/loans", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT emprestimos FROM user_data WHERE user_id = $1", [req.userId]);
    res.json(result.rows[0]?.emprestimos || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/loans", verifyToken, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO user_data (user_id, emprestimos) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET emprestimos = $2, updated_at = NOW()`,
      [req.userId, JSON.stringify(req.body)]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/payments", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT pagamentos FROM user_data WHERE user_id = $1", [req.userId]);
    res.json(result.rows[0]?.pagamentos || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/payments", verifyToken, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO user_data (user_id, pagamentos) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET pagamentos = $2, updated_at = NOW()`,
      [req.userId, JSON.stringify(req.body)]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", db: "conectado", message: "Gil.Finanças PRO está funcionando!" });
  } catch {
    res.json({ status: "OK", db: "sem conexão", message: "Gil.Finanças PRO está funcionando!" });
  }
});

app.listen(PORT, () => {
  console.log("🚀 Gil.Finanças PRO rodando!");
});
