# 🖥️ ETAPA 2: BACKEND (API COM NODE.JS + EXPRESS)

## **PARTE A: ESTRUTURA DO PROJETO**

```
financeiro-api/
├── src/
│   ├── config/
│   │   ├── database.js          # Conexão PostgreSQL
│   │   ├── env.js               # Variáveis de ambiente
│   │   └── constants.js         # Constantes da app
│   ├── middlewares/
│   │   ├── auth.js              # Autenticação JWT
│   │   ├── errorHandler.js      # Tratamento de erros
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── validation.js        # Validação de dados
│   ├── routes/
│   │   ├── auth.js              # Rotas de autenticação
│   │   ├── users.js             # Rotas de usuários
│   │   ├── clients.js           # Rotas de clientes
│   │   ├── loans.js             # Rotas de empréstimos
│   │   ├── payments.js          # Rotas de pagamentos
│   │   ├── reminders.js         # Rotas de lembretes
│   │   ├── dashboard.js         # Rotas do dashboard
│   │   └── reports.js           # Rotas de relatórios
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── clientController.js
│   │   ├── loanController.js
│   │   ├── paymentController.js
│   │   ├── reminderController.js
│   │   ├── dashboardController.js
│   │   └── reportController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Loan.js
│   │   ├── Payment.js
│   │   ├── Widget.js
│   │   └── Audit.js
│   ├── services/
│   │   ├── authService.js       # Lógica de autenticação
│   │   ├── jwtService.js        # JWT tokens
│   │   ├── emailService.js      # Envio de emails
│   │   ├── smsService.js        # Envio de SMS
│   │   ├── loanService.js       # Cálculos de juros
│   │   └── reportService.js     # Geração de relatórios
│   ├── utils/
│   │   ├── validation.js        # Validações
│   │   ├── encryption.js        # Criptografia
│   │   ├── calculations.js      # Cálculos matemáticos
│   │   └── logger.js            # Sistema de logs
│   └── app.js                   # Inicialização Express
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_clients.sql
│   ├── 003_create_loans.sql
│   ├── 004_create_payments.sql
│   ├── 005_create_widgets.sql
│   └── 006_create_audit.sql
├── seeds/
│   └── seed.sql                 # Dados de teste
├── tests/
│   ├── auth.test.js
│   ├── clients.test.js
│   ├── loans.test.js
│   └── payments.test.js
├── .env.example
├── .gitignore
├── package.json
└── server.js                    # Entrada da aplicação
```

---

## **PARTE B: ARQUIVOS DE CONFIGURAÇÃO**

### **1. package.json**

```json
{
  "name": "financeiro-api",
  "version": "1.0.0",
  "description": "API de Controle Financeiro para Empréstimos",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "migrate": "node migrations/migrate.js",
    "seed": "psql -f seeds/seed.sql"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.10.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.0",
    "nodemailer": "^6.9.7",
    "twilio": "^3.99.0",
    "uuid": "^9.0.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "moment": "^2.29.4",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### **2. .env.example**

```env
# Servidor
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financeiro_db
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_muito_longa_e_aleatoria
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app

# SMS/WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=seu_sid
TWILIO_AUTH_TOKEN=seu_token
TWILIO_PHONE_NUMBER=+5511999999999

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logs
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### **3. src/config/database.js**

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com banco de dados:', err);
});

module.exports = pool;
```

### **4. src/config/constants.js**

```javascript
module.exports = {
  // Status de empréstimos
  LOAN_STATUS: {
    ACTIVE: 'ativo',
    OVERDUE: 'vencido',
    PAID: 'pago',
    CANCELLED: 'cancelado'
  },

  // Tipos de período
  PERIOD_TYPES: {
    DAILY: 'diario',
    WEEKLY: 'semanal',
    BIWEEKLY: 'quinzenal',
    MONTHLY: 'mensal'
  },

  // Dias por período
  DAYS_PER_PERIOD: {
    'diario': 1,
    'semanal': 7,
    'quinzenal': 15,
    'mensal': 30
  },

  // Tipos de juros
  INTEREST_TYPES: {
    SIMPLE: 'simples',
    COMPOUND: 'compostos'
  },

  // Status de usuário
  USER_STATUS: {
    ACTIVE: 'ativo',
    INACTIVE: 'inativo',
    BLOCKED: 'bloqueado'
  },

  // Validações de senha
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    uppercase: true,
    numbers: true,
    special: false
  },

  // Códigos de recuperação
  RECOVERY_CODE_LENGTH: 6,
  RECOVERY_CODE_EXPIRATION: 30 * 60 * 1000, // 30 minutos em ms

  // JWT
  JWT_ALGORITHM: 'HS256'
};
```

---

## **PARTE C: AUTENTICAÇÃO E SEGURANÇA**

### **1. src/services/jwtService.js**

```javascript
const jwt = require('jsonwebtoken');

class JWTService {
  static generateToken(userId, email) {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
  }

  static generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = JWTService;
```

### **2. src/services/authService.js**

```javascript
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const JWTService = require('./jwtService');
const EmailService = require('./emailService');
const { RECOVERY_CODE_LENGTH } = require('../config/constants');

class AuthService {
  // Registrar novo usuário
  static async registerUser(email, password, nome_dono, telefone, nome_empresa = null) {
    try {
      // Validar email único
      const userExists = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );

      if (userExists.rows.length > 0) {
        throw new Error('Email já cadastrado');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      // Inserir usuário
      const result = await pool.query(
        `INSERT INTO usuarios (id, email, senha_hash, nome_dono, telefone, nome_empresa)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, nome_dono`,
        [userId, email, hashedPassword, nome_dono, telefone, nome_empresa]
      );

      // Criar configurações padrão
      await pool.query(
        `INSERT INTO configuracoes (usuario_id)
         VALUES ($1)`,
        [userId]
      );

      // Enviar email de confirmação
      await EmailService.sendConfirmationEmail(email, nome_dono);

      return { userId, email: result.rows[0].email };
    } catch (error) {
      throw new Error(`Erro ao registrar: ${error.message}`);
    }
  }

  // Login
  static async login(email, password) {
    try {
      const result = await pool.query(
        'SELECT id, email, senha_hash, status, autenticacao_2fa FROM usuarios WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Email ou senha incorretos');
      }

      const user = result.rows[0];

      // Validar status
      if (user.status !== 'ativo') {
        throw new Error('Conta inativa ou bloqueada');
      }

      // Comparar senhas
      const passwordMatch = await bcrypt.compare(password, user.senha_hash);
      if (!passwordMatch) {
        throw new Error('Email ou senha incorretos');
      }

      // Se 2FA ativado, enviar código
      if (user.autenticacao_2fa) {
        const codigo_2fa = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracao = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

        await pool.query(
          'UPDATE usuarios SET codigo_2fa = $1, data_expiracao_2fa = $2 WHERE id = $3',
          [codigo_2fa, expiracao, user.id]
        );

        // Enviar código por email
        await EmailService.send2FACode(email, codigo_2fa);

        return { userId: user.id, requires2FA: true };
      }

      // Gerar token
      const token = JWTService.generateToken(user.id, user.email);
      const refreshToken = JWTService.generateRefreshToken(user.id);

      // Registrar login em auditoria
      await pool.query(
        `INSERT INTO auditoria (usuario_id, acao, data_hora)
         VALUES ($1, $2, NOW())`,
        [user.id, 'login']
      );

      // Atualizar último login
      await pool.query(
        'UPDATE usuarios SET data_ultimo_login = NOW() WHERE id = $1',
        [user.id]
      );

      return { userId: user.id, token, refreshToken };
    } catch (error) {
      throw new Error(`Erro ao fazer login: ${error.message}`);
    }
  }

  // Recuperar Conta - Solicitar
  static async requestAccountRecovery(email, method) {
    try {
      const result = await pool.query(
        'SELECT id, nome_dono, email, telefone FROM usuarios WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Email não encontrado');
      }

      const user = result.rows[0];

      // Gerar código de 6 dígitos
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      const expiracao = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

      // Salvar código
      await pool.query(
        `INSERT INTO recuperacao_conta (usuario_id, tipo_recuperacao, codigo_confirmacao, data_expiracao)
         VALUES ($1, $2, $3, $4)`,
        [user.id, method, codigo, expiracao]
      );

      // Enviar código
      if (method === 'email') {
        await EmailService.sendRecoveryCode(user.email, codigo, user.nome_dono);
      } else if (method === 'telefone') {
        // SMS via Twilio
        await SMSService.sendRecoveryCode(user.telefone, codigo);
      }

      return { success: true, message: 'Código enviado com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao recuperar conta: ${error.message}`);
    }
  }

  // Confirmar código de recuperação
  static async verifyRecoveryCode(email, codigo) {
    try {
      const userResult = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Email não encontrado');
      }

      const userId = userResult.rows[0].id;

      const codeResult = await pool.query(
        `SELECT id, codigo_confirmacao, data_expiracao FROM recuperacao_conta
         WHERE usuario_id = $1
         ORDER BY data_criacao DESC
         LIMIT 1`,
        [userId]
      );

      if (codeResult.rows.length === 0) {
        throw new Error('Solicitação de recuperação não encontrada');
      }

      const recovery = codeResult.rows[0];

      // Validar expiração
      if (new Date() > new Date(recovery.data_expiracao)) {
        throw new Error('Código expirou');
      }

      // Validar código
      if (recovery.codigo_confirmacao !== codigo) {
        throw new Error('Código inválido');
      }

      // Gerar token temporário para reset de senha
      const resetToken = JWTService.generateToken(userId, email);

      return { resetToken, success: true };
    } catch (error) {
      throw new Error(`Erro ao validar código: ${error.message}`);
    }
  }

  // Redefinir senha
  static async resetPassword(userId, newPassword) {
    try {
      // Validar senha
      if (newPassword.length < 8) {
        throw new Error('Senha deve ter pelo menos 8 caracteres');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await pool.query(
        'UPDATE usuarios SET senha_hash = $1 WHERE id = $2',
        [hashedPassword, userId]
      );

      // Limpar tokens de recuperação
      await pool.query(
        'DELETE FROM recuperacao_conta WHERE usuario_id = $1',
        [userId]
      );

      return { success: true, message: 'Senha atualizada com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao redefinir senha: ${error.message}`);
    }
  }

  // Verificar código 2FA
  static async verify2FACode(userId, codigo) {
    try {
      const result = await pool.query(
        `SELECT codigo_2fa, data_expiracao_2fa FROM usuarios WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const user = result.rows[0];

      // Validar expiração
      if (new Date() > new Date(user.data_expiracao_2fa)) {
        throw new Error('Código 2FA expirou');
      }

      // Validar código
      if (user.codigo_2fa !== codigo) {
        throw new Error('Código 2FA inválido');
      }

      // Limpar código
      await pool.query(
        'UPDATE usuarios SET codigo_2fa = NULL, data_expiracao_2fa = NULL WHERE id = $1',
        [userId]
      );

      // Gerar token
      const email = await pool.query(
        'SELECT email FROM usuarios WHERE id = $1',
        [userId]
      );

      const token = JWTService.generateToken(userId, email.rows[0].email);
      const refreshToken = JWTService.generateRefreshToken(userId);

      return { token, refreshToken };
    } catch (error) {
      throw new Error(`Erro ao validar 2FA: ${error.message}`);
    }
  }
}

module.exports = AuthService;
```

### **3. src/middlewares/auth.js**

```javascript
const JWTService = require('../services/jwtService');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = JWTService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Erro ao validar token' });
  }
};

module.exports = authMiddleware;
```

---

## **PARTE D: ROTAS DE AUTENTICAÇÃO**

### **src/routes/auth.js**

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registro
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Recuperar conta - Solicitar
router.post('/recuperar', authController.requestRecovery);

// Recuperar conta - Confirmar código
router.post('/recuperar/confirmar', authController.verifyRecoveryCode);

// Resetar senha
router.post('/resetar-senha', authController.resetPassword);

// Verificar 2FA
router.post('/2fa/verificar', authController.verify2FA);

// Ativar 2FA
router.post('/2fa/ativar', authController.enable2FA);

module.exports = router;
```

---

## **PARTE E: CÁLCULOS DE JUROS**

### **src/services/loanService.js**

```javascript
const pool = require('../config/database');
const { DAYS_PER_PERIOD } = require('../config/constants');

class LoanService {
  // Calcular juros acumulados
  static calculateAccumulatedInterest(valor, taxa, tipo_juros, tipo_periodo, diasDecorridos) {
    const daysPerPeriod = DAYS_PER_PERIOD[tipo_periodo] || 1;
    const periodsPassed = diasDecorridos / daysPerPeriod;

    if (tipo_juros === 'simples') {
      // Juros Simples: J = C * i * t
      return valor * (taxa / 100) * periodsPassed;
    } else {
      // Juros Compostos: M = C * (1 + i)^t
      const montante = valor * Math.pow(1 + (taxa / 100), periodsPassed);
      return montante - valor;
    }
  }

  // Calcular saldo devedor
  static calculateDebt(valor, jurosAcumulados, pagamentosTotais) {
    return (valor + jurosAcumulados) - pagamentosTotais;
  }

  // Atualizar juros acumulados de um empréstimo
  static async updateLoanInterest(loanId) {
    try {
      const result = await pool.query(
        `SELECT l.id, l.valor, l.taxa_juros, l.tipo_juros, l.tipo_periodo, l.data_emprestimo,
                l.status, COALESCE(SUM(p.valor_pago), 0) as total_pago
         FROM emprestimos l
         LEFT JOIN pagamentos p ON l.id = p.emprestimo_id
         WHERE l.id = $1
         GROUP BY l.id`,
        [loanId]
      );

      if (result.rows.length === 0) {
        throw new Error('Empréstimo não encontrado');
      }

      const loan = result.rows[0];

      // Se já está pago, não calcular mais juros
      if (loan.status === 'pago') {
        return;
      }

      const dataEmprestimo = new Date(loan.data_emprestimo);
      const hoje = new Date();
      const diasDecorridos = Math.floor((hoje - dataEmprestimo) / (1000 * 60 * 60 * 24));

      const jurosAcumulados = this.calculateAccumulatedInterest(
        loan.valor,
        loan.taxa_juros,
        loan.tipo_juros,
        loan.tipo_periodo,
        diasDecorridos
      );

      const saldoDevedor = this.calculateDebt(
        loan.valor,
        jurosAcumulados,
        loan.total_pago
      );

      // Atualizar no banco
      await pool.query(
        `UPDATE emprestimos
         SET juros_acumulados = $1, saldo_devedor = $2
         WHERE id = $3`,
        [jurosAcumulados, saldoDevedor, loanId]
      );

      return { jurosAcumulados, saldoDevedor };
    } catch (error) {
      throw new Error(`Erro ao atualizar juros: ${error.message}`);
    }
  }

  // Buscar todos empréstimos e atualizar juros
  static async updateAllLoansInterest(userId) {
    try {
      const loans = await pool.query(
        'SELECT id FROM emprestimos WHERE usuario_id = $1 AND status != $2',
        [userId, 'pago']
      );

      for (const loan of loans.rows) {
        await this.updateLoanInterest(loan.id);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Erro ao atualizar todos os juros: ${error.message}`);
    }
  }
}

module.exports = LoanService;
```

---

## **✅ CHECKLIST - ETAPA 2**

- [x] Estrutura de projeto completa
- [x] Configuração de banco de dados
- [x] Sistema de autenticação JWT
- [x] Sistema de recuperação de conta
- [x] Serviço de autenticação (login, registro, recovery)
- [x] Middleware de autenticação
- [x] Cálculos de juros (simples e compostos)
- [x] Rotas de autenticação
- [x] Validações de segurança
- [x] Sistema de 2FA

---

## **PRÓXIMOS PASSOS**

✅ **ETAPA 2 PARCIAL COMPLETA**

→ Continuar Etapa 2:
  - [ ] Controllers CRUD (clients, loans, payments)
  - [ ] Rotas CRUD
  - [ ] Email/SMS Service
  - [ ] Dashboard Controllers
  - [ ] Relatórios Controllers
  - [ ] Testes da API

→ Depois: **ETAPA 3 - FRONTEND WEB (React)**
