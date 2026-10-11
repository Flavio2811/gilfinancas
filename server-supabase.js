const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
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

// Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rslhrihbvzoeilkmjbwh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

if (!SUPABASE_KEY) {
    console.warn('⚠️  SUPABASE_KEY não configurada! Configure no arquivo .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

// ===== ROUTES - AUTENTICAÇÃO =====
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        // Verificar se usuário já existe
        const { data: existingUser } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email já registrado' });
        }

        // Criar novo usuário
        const { data: newUser, error } = await supabase
            .from('usuarios')
            .insert([{
                email,
                password_hash: bcryptjs.hashSync(password, 8),
                name,
                phone: phone || null
            }])
            .select()
            .single();

        if (error) throw error;

        const token = generateToken(newUser.id);

        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            token,
            user: { id: newUser.id, email: newUser.email, name: newUser.name }
        });
    } catch (error) {
        console.error('❌ Erro no registro:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        if (!bcryptjs.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const token = generateToken(user.id);

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        console.error('❌ Erro no login:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===== ROUTES - CLIENTES =====
app.post('/clients', verifyToken, async (req, res) => {
    try {
        const { name, email, phone, whatsapp, address } = req.body;

        const { data: newClient, error } = await supabase
            .from('clientes')
            .insert([{
                user_id: req.userId,
                name,
                email: email || null,
                phone: phone || null,
                whatsapp: whatsapp || null,
                address: address || null
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'Cliente criado com sucesso',
            client: newClient
        });
    } catch (error) {
        console.error('❌ Erro ao criar cliente:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/clients', verifyToken, async (req, res) => {
    try {
        const { data: clients, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('user_id', req.userId);

        if (error) throw error;

        res.json(clients || []);
    } catch (error) {
        console.error('❌ Erro ao listar clientes:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/clients/:id', verifyToken, async (req, res) => {
    try {
        const { data: client, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (error) throw error;
        if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });

        res.json(client);
    } catch (error) {
        console.error('❌ Erro ao obter cliente:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.put('/clients/:id', verifyToken, async (req, res) => {
    try {
        const { data: updated, error } = await supabase
            .from('clientes')
            .update(req.body)
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        if (!updated) return res.status(404).json({ error: 'Cliente não encontrado' });

        res.json({ message: 'Cliente atualizado', client: updated });
    } catch (error) {
        console.error('❌ Erro ao atualizar cliente:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/clients/:id', verifyToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId);

        if (error) throw error;

        res.json({ message: 'Cliente deletado com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao deletar cliente:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===== ROUTES - EMPRÉSTIMOS =====
app.post('/loans', verifyToken, async (req, res) => {
    try {
        const { clientId, amount, rate, period, interestType } = req.body;

        const { data: newLoan, error } = await supabase
            .from('emprestimos')
            .insert([{
                user_id: req.userId,
                client_id: clientId,
                amount,
                rate,
                period,
                interest_type: interestType || 'simple',
                status: 'ativo',
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'Empréstimo criado com sucesso',
            loan: newLoan
        });
    } catch (error) {
        console.error('❌ Erro ao criar empréstimo:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/loans', verifyToken, async (req, res) => {
    try {
        const { data: loans, error } = await supabase
            .from('emprestimos')
            .select('*')
            .eq('user_id', req.userId);

        if (error) throw error;

        // Calcular juros acumulados
        const loansWithInterest = (loans || []).map(loan => ({
            ...loan,
            accumulatedInterest: calculateInterest(
                loan.amount,
                loan.rate,
                Math.floor((Date.now() - new Date(loan.created_at).getTime()) / (1000 * 60 * 60 * 24)),
                loan.interest_type
            ),
            totalDue: loan.amount + calculateInterest(
                loan.amount,
                loan.rate,
                Math.floor((Date.now() - new Date(loan.created_at).getTime()) / (1000 * 60 * 60 * 24)),
                loan.interest_type
            )
        }));

        res.json(loansWithInterest);
    } catch (error) {
        console.error('❌ Erro ao listar empréstimos:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/loans/:id', verifyToken, async (req, res) => {
    try {
        const { data: loan, error } = await supabase
            .from('emprestimos')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (error) throw error;
        if (!loan) return res.status(404).json({ error: 'Empréstimo não encontrado' });

        const daysElapsed = Math.floor((Date.now() - new Date(loan.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const interest = calculateInterest(loan.amount, loan.rate, daysElapsed, loan.interest_type);

        res.json({
            ...loan,
            accumulatedInterest: interest,
            totalDue: loan.amount + interest
        });
    } catch (error) {
        console.error('❌ Erro ao obter empréstimo:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===== ROUTES - PAGAMENTOS =====
app.post('/payments', verifyToken, async (req, res) => {
    try {
        const { loanId, amount, paymentDate, method } = req.body;

        const { data: newPayment, error } = await supabase
            .from('pagamentos')
            .insert([{
                user_id: req.userId,
                loan_id: loanId,
                amount,
                payment_date: paymentDate || new Date().toISOString(),
                method: method || 'dinheiro',
                status: 'confirmado'
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'Pagamento registrado com sucesso',
            payment: newPayment
        });
    } catch (error) {
        console.error('❌ Erro ao registrar pagamento:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/payments', verifyToken, async (req, res) => {
    try {
        const { data: payments, error } = await supabase
            .from('pagamentos')
            .select('*')
            .eq('user_id', req.userId)
            .order('payment_date', { ascending: false });

        if (error) throw error;

        res.json(payments || []);
    } catch (error) {
        console.error('❌ Erro ao listar pagamentos:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===== ROUTES - DASHBOARD =====
app.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const { data: clients } = await supabase
            .from('clientes')
            .select('id')
            .eq('user_id', req.userId);

        const { data: loans } = await supabase
            .from('emprestimos')
            .select('*')
            .eq('user_id', req.userId);

        const { data: payments } = await supabase
            .from('pagamentos')
            .select('amount')
            .eq('user_id', req.userId);

        const totalLoaned = (loans || []).reduce((sum, loan) => sum + loan.amount, 0);
        const totalPayments = (payments || []).reduce((sum, payment) => sum + payment.amount, 0);
        const activeLoans = (loans || []).filter(l => l.status === 'ativo').length;

        let totalDue = 0;
        (loans || []).forEach(loan => {
            const daysElapsed = Math.floor((Date.now() - new Date(loan.created_at).getTime()) / (1000 * 60 * 60 * 24));
            const interest = calculateInterest(loan.amount, loan.rate, daysElapsed, loan.interest_type);
            totalDue += loan.amount + interest;
        });

        res.json({
            stats: {
                totalClients: clients?.length || 0,
                totalLoans: loans?.length || 0,
                activeLoans,
                totalLoaned,
                totalPayments,
                totalDue: Math.max(0, totalDue - totalPayments)
            }
        });
    } catch (error) {
        console.error('❌ Erro ao obter dashboard:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
    res.json({ status: '✅ Servidor rodando', version: '2.0-supabase' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║    🚀 GIL.FINANÇAS Backend (Supabase) rodando! 🚀         ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n📍 Servidor: http://localhost:${PORT}`);
    console.log(`📊 Supabase Project: ${SUPABASE_URL}`);
    console.log('\n✅ Endpoints disponíveis:');
    console.log('   POST   /auth/register        - Registrar usuário');
    console.log('   POST   /auth/login           - Fazer login');
    console.log('   POST   /clients              - Criar cliente');
    console.log('   GET    /clients              - Listar clientes');
    console.log('   GET    /clients/:id          - Obter cliente');
    console.log('   PUT    /clients/:id          - Atualizar cliente');
    console.log('   DELETE /clients/:id          - Deletar cliente');
    console.log('   POST   /loans                - Criar empréstimo');
    console.log('   GET    /loans                - Listar empréstimos');
    console.log('   GET    /loans/:id            - Obter empréstimo');
    console.log('   POST   /payments             - Registrar pagamento');
    console.log('   GET    /payments             - Listar pagamentos');
    console.log('   GET    /dashboard            - Dashboard com estatísticas');
    console.log('\n');
});

module.exports = app;
