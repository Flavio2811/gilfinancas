const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "seu_secret_key_super_seguro_2026";

let usuarios = [
  {
    id: 1,
    email: "flavio.guerreiro.da.esperanca@gmail.com",
    password_hash: bcryptjs.hashSync("gilfinancas@2024", 8),
    name: "Flavio Guerreiro",
    phone: "(11) 9 9999-8888",
    email_recuperacao1: "flavio.recuperacao1@gmail.com",
    email_recuperacao2: "flavio.recuperacao2@gmail.com",
    phone_recuperacao: "(11) 98888-7777",
    whatsapp_recuperacao: "(11) 97777-6666",
    created_at: new Date()
  }
];
let resetCodes = {};
let userAppData = {};

app.use(express.json());
app.use(express.static(path.dirname(__filename)));

app.get("/", (req, res) => {
    try {
        res.set("Cache-Control", "no-cache, no-store, must-revalidate");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
        res.sendFile(path.join(__dirname, "app-expanded.html"));
    } catch (err) {
        res.status(200).send("<h1>Gil.Finanças PRO</h1><p>Servidor funcionando!</p>");
    }
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

app.post("/auth/register", (req, res) => {
    try {
        const { email, password, name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao } = req.body;

        if (usuarios.find(u => u.email === email)) {
            return res.status(400).json({ error: "Email já registrado" });
        }

        const passwordHash = bcryptjs.hashSync(password, 8);
        const user = {
            id: usuarios.length + 1,
            email,
            password_hash: passwordHash,
            name,
            phone: phone || null,
            email_recuperacao1: email_recuperacao1 || null,
            email_recuperacao2: email_recuperacao2 || null,
            phone_recuperacao: phone_recuperacao || null,
            whatsapp_recuperacao: whatsapp_recuperacao || null,
            created_at: new Date()
        };

        usuarios.push(user);
        const token = generateToken(user.id);
        res.status(201).json({ message: "Usuário registrado com sucesso", token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/auth/login", (req, res) => {
    try {
        const { email, password } = req.body;
        const user = usuarios.find(u => u.email === email);

        if (!user || !bcryptjs.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: "Email ou senha incorretos" });
        }

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/auth/forgot-password", (req, res) => {
    try {
        const { email } = req.body;
        const user = usuarios.find(u => u.email === email);

        if (!user) {
            return res.status(400).json({ error: "Email não encontrado" });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        resetCodes[email] = {
            code: code,
            expiresAt: Date.now() + 15 * 60 * 1000
        };

        res.json({
            message: "Código enviado",
            testCode: code,
            recoveryContacts: {
                email1: user.email_recuperacao1 ? "✓ " + user.email_recuperacao1.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
                email2: user.email_recuperacao2 ? "✓ " + user.email_recuperacao2.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
                phone: user.phone_recuperacao ? "✓ " + user.phone_recuperacao.replace(/(.{2})(.*)(.{2})/, '$1***$3') : null,
                whatsapp: user.whatsapp_recuperacao ? "✓ " + user.whatsapp_recuperacao.replace(/(.{2})(.*)(.{2})/, '$1***$3') : null
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/auth/reset-password", (req, res) => {
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

        const user = usuarios.find(u => u.email === email);
        if (user) {
            user.password_hash = bcryptjs.hashSync(password, 8);
            delete resetCodes[email];
            res.json({ message: "Senha resetada com sucesso" });
        } else {
            res.status(404).json({ error: "Usuário não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/perfil", verifyToken, (req, res) => {
    try {
        const user = usuarios.find(u => u.id === req.userId);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            email_recuperacao1: user.email_recuperacao1,
            email_recuperacao2: user.email_recuperacao2,
            phone_recuperacao: user.phone_recuperacao,
            whatsapp_recuperacao: user.whatsapp_recuperacao
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/perfil", verifyToken, (req, res) => {
    try {
        const { name, phone, email_recuperacao1, email_recuperacao2, phone_recuperacao, whatsapp_recuperacao } = req.body;
        const user = usuarios.find(u => u.id === req.userId);

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (email_recuperacao1 !== undefined) user.email_recuperacao1 = email_recuperacao1;
        if (email_recuperacao2 !== undefined) user.email_recuperacao2 = email_recuperacao2;
        if (phone_recuperacao !== undefined) user.phone_recuperacao = phone_recuperacao;
        if (whatsapp_recuperacao !== undefined) user.whatsapp_recuperacao = whatsapp_recuperacao;

        res.json({ message: "Perfil atualizado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/perfil/senha", verifyToken, (req, res) => {
    try {
        const { senhaAtual, senhaNova } = req.body;
        const user = usuarios.find(u => u.id === req.userId);

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        const validPassword = bcryptjs.compareSync(senhaAtual, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: "Senha atual incorreta" });
        }

        user.password_hash = bcryptjs.hashSync(senhaNova, 8);
        res.json({ message: "Senha atualizada com sucesso" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/clients", verifyToken, (req, res) => {
    res.json(userAppData[req.userId]?.clientes || []);
});
app.post("/clients", verifyToken, (req, res) => {
    if (!userAppData[req.userId]) userAppData[req.userId] = {};
    userAppData[req.userId].clientes = req.body;
    res.json({ ok: true });
});

app.get("/loans", verifyToken, (req, res) => {
    res.json(userAppData[req.userId]?.emprestimos || []);
});
app.post("/loans", verifyToken, (req, res) => {
    if (!userAppData[req.userId]) userAppData[req.userId] = {};
    userAppData[req.userId].emprestimos = req.body;
    res.json({ ok: true });
});

app.get("/payments", verifyToken, (req, res) => {
    res.json(userAppData[req.userId]?.pagamentos || []);
});
app.post("/payments", verifyToken, (req, res) => {
    if (!userAppData[req.userId]) userAppData[req.userId] = {};
    userAppData[req.userId].pagamentos = req.body;
    res.json({ ok: true });
});

app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Gil.Finanças PRO está funcionando!" });
});

app.listen(PORT, () => {
    console.log("🚀 Gil.Finanças PRO rodando!");
});
