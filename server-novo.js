const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_super_segura_2026";

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(path.dirname(__filename)));

// Armazenar usuários em memória
let usuarios = {};

// ===== ROUTES - AUTENTICAÇÃO =====
app.post("/auth/register", async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email e senha são obrigatórios" });
        }

        // Verificar se usuário já existe
        if (usuarios[email]) {
            return res.status(400).json({ error: "Email já registrado" });
        }

        // Criar novo usuário
        const passwordHash = bcryptjs.hashSync(password, 8);
        const userId = "user_" + Date.now();
        
        usuarios[email] = {
            id: userId,
            email,
            password_hash: passwordHash,
            name: name || email,
            phone: phone || null,
            created_at: new Date().toISOString()
        };

        const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            message: "Usuário registrado com sucesso",
            token,
            user: { id: userId, email, name: name || email }
        });
    } catch (error) {
        console.error("Erro no registro:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email e senha são obrigatórios" });
        }

        const user = usuarios[email];

        if (!user) {
            return res.status(401).json({ error: "Email ou senha incorretos" });
        }

        const validPassword = bcryptjs.compareSync(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: "Email ou senha incorretos" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        
        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        console.error("Erro no login:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Servidor funcionando!" });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log("");
    console.log("════════════════════════════════════════════════════════════");
    console.log("");
    console.log("  🚀 GIL.FINANÇAS Backend rodando!");
    console.log("     Servidor: http://localhost:" + PORT);
    console.log("");
    console.log("════════════════════════════════════════════════════════════");
    console.log("");
});
