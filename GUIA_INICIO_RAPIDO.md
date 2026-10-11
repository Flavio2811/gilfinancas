# 🚀 GUIA DE INÍCIO RÁPIDO - DESENVOLVIMENTO

**Documento para começar a implementação prática do projeto**

---

## **PASSO 1: PREPARAÇÃO DO AMBIENTE (30 minutos)**

### **1.1 Instalar Ferramentas Necessárias**

```bash
# Node.js v16+ (download em https://nodejs.org)
node --version
npm --version

# PostgreSQL (download em https://www.postgresql.org/download)
psql --version

# Git
git --version

# VS Code (recomendado)
# https://code.visualstudio.com/
```

### **1.2 Criar Pasta do Projeto**

```bash
# Criar diretório
mkdir financeiro-app
cd financeiro-app

# Inicializar git
git init

# Criar pastas principais
mkdir backend frontend tests
```

### **1.3 Criar Banco de Dados PostgreSQL**

```bash
# Acessar PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE financeiro_db;
CREATE USER financeiro_user WITH PASSWORD 'sua_senha_segura';
ALTER ROLE financeiro_user SET client_encoding TO 'utf8';
ALTER ROLE financeiro_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE financeiro_user SET default_transaction_deferrable TO on;
ALTER ROLE financeiro_user SET default_transaction_read_only TO off;
ALTER ROLE financeiro_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE financeiro_db TO financeiro_user;

# Sair
\q
```

---

## **PASSO 2: CONFIGURAR BACKEND (1-2 horas)**

### **2.1 Inicializar Projeto Node.js**

```bash
cd backend
npm init -y
npm install express pg bcryptjs jsonwebtoken dotenv cors helmet morgan uuid nodemailer twilio moment axios
npm install --save-dev nodemon jest supertest
```

### **2.2 Criar Estrutura de Pastas**

```bash
mkdir src
mkdir src/config
mkdir src/controllers
mkdir src/middlewares
mkdir src/models
mkdir src/routes
mkdir src/services
mkdir src/utils
mkdir migrations
mkdir seeds
mkdir tests
```

### **2.3 Criar .env**

```bash
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=financeiro_db
DB_USER=financeiro_user
DB_PASSWORD=sua_senha_segura

JWT_SECRET=sua_chave_secreta_super_longa_e_aleatoria_20250101
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app

TWILIO_ACCOUNT_SID=seu_sid
TWILIO_AUTH_TOKEN=seu_token
TWILIO_PHONE_NUMBER=+5511999999999

FRONTEND_URL=http://localhost:3000

RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
EOF
```

### **2.4 Criar package.json scripts**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "migrate": "node migrations/migrate.js"
  }
}
```

### **2.5 Criar Banco de Dados - Script SQL**

```bash
cat > migrations/001_create_tables.sql << 'EOF'
-- Usuários (Autenticação)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    nome_empresa VARCHAR(255),
    nome_dono VARCHAR(255) NOT NULL,
    status ENUM('ativo', 'inativo', 'bloqueado') DEFAULT 'ativo',
    autenticacao_2fa BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_ultimo_login TIMESTAMP
);

-- Configurações
CREATE TABLE configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_juros VARCHAR(50) DEFAULT 'simples',
    taxa_padrao DECIMAL(5,2) DEFAULT 1.0,
    tipo_periodo VARCHAR(50) DEFAULT 'diario',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco TEXT,
    status VARCHAR(50) DEFAULT 'ativo',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Empréstimos
CREATE TABLE emprestimos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    valor DECIMAL(12,2) NOT NULL,
    taxa_juros DECIMAL(5,2) NOT NULL,
    tipo_juros VARCHAR(50),
    tipo_periodo VARCHAR(50),
    data_emprestimo DATE NOT NULL,
    data_vencimento DATE,
    status VARCHAR(50) DEFAULT 'ativo',
    juros_acumulados DECIMAL(12,2) DEFAULT 0,
    saldo_devedor DECIMAL(12,2),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pagamentos
CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    emprestimo_id UUID NOT NULL REFERENCES emprestimos(id),
    valor_pago DECIMAL(12,2) NOT NULL,
    data_pagamento DATE NOT NULL,
    tipo_pagamento VARCHAR(50) DEFAULT 'parcial',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auditoria
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(100),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_clientes_usuario ON clientes(usuario_id);
CREATE INDEX idx_emprestimos_usuario ON emprestimos(usuario_id);
CREATE INDEX idx_emprestimos_cliente ON emprestimos(cliente_id);
CREATE INDEX idx_pagamentos_emprestimo ON pagamentos(emprestimo_id);
EOF
```

### **2.6 Executar Migração**

```bash
psql -U financeiro_user -d financeiro_db -f migrations/001_create_tables.sql
```

### **2.7 Criar arquivo principal - src/app.js**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Importar rotas depois de pronta
// app.use('/api/auth', require('./routes/auth'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;
```

### **2.8 Criar server.js**

```javascript
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
```

### **2.9 Testar Backend**

```bash
npm run dev

# Em outro terminal
curl http://localhost:5000/api/health
```

---

## **PASSO 3: CRIAR PRIMEIRO ENDPOINT (Auth Login)**

### **3.1 Criar src/services/jwtService.js**

```javascript
const jwt = require('jsonwebtoken');

module.exports = {
  generateToken(userId, email) {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return null;
    }
  }
};
```

### **3.2 Criar src/routes/auth.js**

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const JWTService = require('../services/jwtService');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await pool.query(
      'SELECT id, email, senha_hash FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.senha_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const token = JWTService.generateToken(user.id, user.email);

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### **3.3 Integrar rota em src/app.js**

```javascript
app.use('/api/auth', require('./routes/auth'));
```

### **3.4 Testar Login**

```bash
# Primeiro, inserir usuário de teste no banco
psql -U financeiro_user -d financeiro_db

INSERT INTO usuarios (email, senha_hash, nome_dono, telefone, status)
VALUES ('teste@example.com', '$2a$10$...', 'João', '11999999999', 'ativo');

# Depois testar o endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"sua_senha"}'
```

---

## **PASSO 4: COMEÇAR FRONTEND (1 hora)**

### **4.1 Inicializar Projeto React**

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom tailwindcss postcss autoprefixer
```

### **4.2 Criar .env**

```bash
VITE_API_URL=http://localhost:5000/api
```

### **4.3 Criar primeira página (LoginPage.jsx)**

```javascript
import { useState } from 'react';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password }
      );
      
      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6">Controle Financeiro</h1>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
```

### **4.4 Testar Frontend**

```bash
npm run dev
# Acessar http://localhost:5173
```

---

## **PASSO 5: WORKFLOW DE DESENVOLVIMENTO**

### **Processo Recomendado**

```
1. Criar/Atualizar Schema DB
   ↓
2. Criar Service/Model
   ↓
3. Criar Controller
   ↓
4. Criar Route
   ↓
5. Testar com Postman/cURL
   ↓
6. Criar Frontend Component
   ↓
7. Integrar com Backend
   ↓
8. Testar fluxo completo
```

### **Próximos Endpoints para Implementar**

1. **Auth**
   - [ ] POST /register
   - [ ] POST /recuperar
   - [ ] POST /2fa/verificar

2. **Clientes**
   - [ ] GET /clientes
   - [ ] POST /clientes
   - [ ] GET /clientes/:id
   - [ ] PUT /clientes/:id
   - [ ] DELETE /clientes/:id

3. **Empréstimos**
   - [ ] GET /emprestimos
   - [ ] POST /emprestimos
   - [ ] GET /emprestimos/:id
   - [ ] PUT /emprestimos/:id

4. **Pagamentos**
   - [ ] POST /pagamentos
   - [ ] GET /emprestimos/:id/pagamentos

5. **Dashboard**
   - [ ] GET /dashboard/resumo
   - [ ] GET /dashboard/widgets
   - [ ] PUT /dashboard/widgets

6. **Relatórios**
   - [ ] GET /relatorios
   - [ ] GET /relatorios/export

---

## **FERRAMENTAS ÚTEIS**

### **Testes de API**
- **Postman:** https://www.postman.com/
- **Insomnia:** https://insomnia.rest/
- **Thunder Client:** VS Code extension

### **Banco de Dados**
- **DBeaver:** https://dbeaver.io/ (GUI para PostgreSQL)
- **pgAdmin:** http://localhost:5050 (Web interface)

### **Versionamento**
```bash
# Commits bem estruturados
git add .
git commit -m "feat: implementar login com JWT"
git push origin main
```

---

## **CHECKLIST DE IMPLEMENTAÇÃO**

### **Semana 1: Backend Auth (✅ Iniciar)**
- [ ] Setup Node.js + Express
- [ ] PostgreSQL + Migrations
- [ ] JWT Service
- [ ] Login endpoint
- [ ] Recuperação de conta endpoint
- [ ] 2FA endpoint
- [ ] Email Service (preparado)

### **Semana 2: Backend CRUD**
- [ ] Clientes CRUD
- [ ] Empréstimos CRUD
- [ ] Pagamentos CRUD
- [ ] Cálculo de juros
- [ ] Relatórios endpoints

### **Semana 3-4: Frontend Web**
- [ ] Setup React + Vite
- [ ] Login page
- [ ] Dashboard (widgets)
- [ ] Clientes page
- [ ] Empréstimos page
- [ ] Pagamentos page
- [ ] Relatórios page

### **Semana 5: Excel + Testes**
- [ ] Importação Excel
- [ ] Exportação Excel
- [ ] Testes automatizados
- [ ] Testes de segurança

### **Semana 6+: Mobile + Deploy**
- [ ] React Native setup
- [ ] Mobile screens
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Deploy mobile

---

## **COMANDOS ÚTEIS**

```bash
# Backend
cd backend
npm install                          # Instalar dependências
npm run dev                          # Rodar em desenvolvimento
npm test                             # Executar testes
npm run migrate                      # Executar migrações

# Frontend
cd frontend
npm install                          # Instalar dependências
npm run dev                          # Rodar em desenvolvimento
npm run build                        # Build para produção
npm run preview                      # Preview do build

# Database
psql -U financeiro_user -d financeiro_db
\dt                                  # Listar tabelas
\d usuarios                          # Ver estrutura da tabela
SELECT * FROM usuarios;              # Ver dados
```

---

## **SUPORTE & DOCUMENTAÇÃO**

- **Node.js:** https://nodejs.org/docs/
- **Express:** https://expressjs.com/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **React:** https://react.dev/
- **JWT:** https://jwt.io/

---

## **PRÓXIMAS AÇÕES**

1. **Hoje:**
   - [ ] Instalar ferramentas
   - [ ] Preparar banco de dados
   - [ ] Executar primeiras migrações
   - [ ] Testar conexão

2. **Amanhã:**
   - [ ] Implementar autenticação
   - [ ] Criar primeiro endpoint
   - [ ] Testar com Postman

3. **Esta semana:**
   - [ ] Completar auth endpoints
   - [ ] Começar CRUD de clientes
   - [ ] Setup React frontend

---

**Quer que eu continue com o código completo de qualquer etapa?** 🚀

Basta me avisar qual etapa você quer focar e vou criar todo o código pronto para copiar e colar!
