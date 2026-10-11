const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_key_super_seguro_2026';

// In-memory database (substitua por PostgreSQL depois)
const users = [];
const clients = [];
const loans = [];
const payments = [];

// UTILS
function generateToken(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não encontrado' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
}

function calculateInterest(principal, rate, days, type = 'simple') {
    if (type === 'simple') {
        return principal * (rate / 100) * days;
    } else {
        return principal * (Math.pow(1 + rate / 100 / 365, days) - 1);
    }
}

// ROUTES - AUTH
app.post('/auth/register', (req, res) => {
    const { email, password, name, phone } = req.body;

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email já registrado' });
    }

    const user = {
        id: Date.now().toString(),
        email,
        password: bcryptjs.hashSync(password, 8),
        name,
        phone,
        createdAt: new Date()
    };

    users.push(user);
    const token = generateToken(user.id);

    res.status(201).json({
        message: 'Usuário registrado com sucesso',
        token,
        user: { id: user.id, email, name, phone }
    });
});

app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !bcryptjs.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = generateToken(user.id);

    res.json({
        message: 'Login realizado com sucesso',
        token,
        user: { id: user.id, email: user.email, name: user.name, phone: user.phone }
    });
});

// ROUTES - CLIENTES
app.post('/clients', verifyToken, (req, res) => {
    const { name, email, phone, whatsapp, address } = req.body;

    const client = {
        id: Date.now().toString(),
        userId: req.userId,
        name,
        email,
        phone,
        whatsapp,
        address,
        createdAt: new Date()
    };

    clients.push(client);

    res.status(201).json({
        message: 'Cliente adicionado com sucesso',
        client
    });
});

app.get('/clients', verifyToken, (req, res) => {
    const userClients = clients.filter(c => c.userId === req.userId);
    res.json(userClients);
});

app.get('/clients/:id', verifyToken, (req, res) => {
    const client = clients.find(c => c.id === req.params.id && c.userId === req.userId);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(client);
});

app.put('/clients/:id', verifyToken, (req, res) => {
    const client = clients.find(c => c.id === req.params.id && c.userId === req.userId);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });

    Object.assign(client, req.body);
    res.json({ message: 'Cliente atualizado', client });
});

app.delete('/clients/:id', verifyToken, (req, res) => {
    const index = clients.findIndex(c => c.id === req.params.id && c.userId === req.userId);
    if (index === -1) return res.status(404).json({ error: 'Cliente não encontrado' });

    clients.splice(index, 1);
    res.json({ message: 'Cliente deletado' });
});

// ROUTES - EMPRÉSTIMOS
app.post('/loans', verifyToken, (req, res) => {
    const { clientId, amount, rate, period, interestType } = req.body;

    const client = clients.find(c => c.id === clientId && c.userId === req.userId);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });

    const loan = {
        id: Date.now().toString(),
        userId: req.userId,
        clientId,
        amount,
        rate,
        period,
        interestType,
        status: 'ativo',
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    loans.push(loan);

    res.status(201).json({
        message: 'Empréstimo criado com sucesso',
        loan
    });
});

app.get('/loans', verifyToken, (req, res) => {
    const userLoans = loans.filter(l => l.userId === req.userId);
    const loansWithInterest = userLoans.map(loan => {
        const daysElapsed = Math.floor((Date.now() - loan.createdAt) / (1000 * 60 * 60 * 24));
        const interest = calculateInterest(loan.amount, loan.rate, daysElapsed, loan.interestType);
        return { ...loan, accumulatedInterest: interest, totalDue: loan.amount + interest };
    });
    res.json(loansWithInterest);
});

app.get('/loans/:id', verifyToken, (req, res) => {
    const loan = loans.find(l => l.id === req.params.id && l.userId === req.userId);
    if (!loan) return res.status(404).json({ error: 'Empréstimo não encontrado' });

    const daysElapsed = Math.floor((Date.now() - loan.createdAt) / (1000 * 60 * 60 * 24));
    const interest = calculateInterest(loan.amount, loan.rate, daysElapsed, loan.interestType);

    res.json({ ...loan, accumulatedInterest: interest, totalDue: loan.amount + interest });
});

app.put('/loans/:id', verifyToken, (req, res) => {
    const loan = loans.find(l => l.id === req.params.id && l.userId === req.userId);
    if (!loan) return res.status(404).json({ error: 'Empréstimo não encontrado' });

    Object.assign(loan, req.body);
    res.json({ message: 'Empréstimo atualizado', loan });
});

// ROUTES - PAGAMENTOS
app.post('/payments', verifyToken, (req, res) => {
    const { loanId, amount, paymentDate, method } = req.body;

    const loan = loans.find(l => l.id === loanId && l.userId === req.userId);
    if (!loan) return res.status(404).json({ error: 'Empréstimo não encontrado' });

    const payment = {
        id: Date.now().toString(),
        userId: req.userId,
        loanId,
        amount,
        paymentDate: new Date(paymentDate),
        method,
        status: 'confirmado',
        createdAt: new Date()
    };

    payments.push(payment);

    res.status(201).json({
        message: 'Pagamento registrado com sucesso',
        payment
    });
});

app.get('/payments', verifyToken, (req, res) => {
    const userPayments = payments.filter(p => p.userId === req.userId);
    res.json(userPayments);
});

app.get('/payments/:loanId', verifyToken, (req, res) => {
    const loanPayments = payments.filter(p => p.loanId === req.params.loanId && p.userId === req.userId);
    res.json(loanPayments);
});

// ROUTES - DASHBOARD
app.get('/dashboard', verifyToken, (req, res) => {
    const userLoans = loans.filter(l => l.userId === req.userId);
    const userClients = clients.filter(c => c.userId === req.userId);
    const userPayments = payments.filter(p => p.userId === req.userId);

    const totalLoaned = userLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalPayments = userPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalDue = totalLoaned + userLoans.reduce((sum, loan) => {
        const daysElapsed = Math.floor((Date.now() - loan.createdAt) / (1000 * 60 * 60 * 24));
        const interest = calculateInterest(loan.amount, loan.rate, daysElapsed, loan.interestType);
        return sum + interest;
    }, 0);

    res.json({
        stats: {
            totalClients: userClients.length,
            totalLoans: userLoans.length,
            activeLoans: userLoans.filter(l => l.status === 'ativo').length,
            totalLoaned,
            totalPayments,
            totalDue,
            overdueAmount: 0
        }
    });
});

// ROUTES - EXPORT
app.get('/export/csv', verifyToken, (req, res) => {
    const userLoans = loans.filter(l => l.userId === req.userId);
    const userClients = clients.filter(c => c.userId === req.userId);

    let csv = 'Cliente,Valor,Taxa,Período,Status,Data Criação\n';
    userLoans.forEach(loan => {
        const client = userClients.find(c => c.id === loan.clientId);
        csv += `${client?.name || 'Desconhecido'},${loan.amount},${loan.rate}%,${loan.period},${loan.status},${loan.createdAt}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=emprestimos.csv');
    res.send(csv);
});

// ROUTES - ALERTAS/COBRANÇAS
app.get('/alerts', verifyToken, (req, res) => {
    const userLoans = loans.filter(l => l.userId === req.userId);
    const alerts = userLoans.filter(loan => {
        const daysSinceLoan = Math.floor((Date.now() - loan.dueDate) / (1000 * 60 * 60 * 24));
        return daysSinceLoan > 0;
    }).map(loan => ({
        id: loan.id,
        type: 'overduePayment',
        message: `Empréstimo vencido há ${Math.floor((Date.now() - loan.dueDate) / (1000 * 60 * 60 * 24))} dias`,
        loanId: loan.id,
        severity: 'high'
    }));

    res.json(alerts);
});

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📦 Ambientes disponíveis:`);
    console.log(`   - POST /auth/register - Registrar novo usuário`);
    console.log(`   - POST /auth/login - Fazer login`);
    console.log(`   - POST /clients - Criar cliente`);
    console.log(`   - GET  /clients - Listar clientes`);
    console.log(`   - POST /loans - Criar empréstimo`);
    console.log(`   - GET  /loans - Listar empréstimos`);
    console.log(`   - POST /payments - Registrar pagamento`);
    console.log(`   - GET  /dashboard - Dashboard com estatísticas`);
});

module.exports = app;
