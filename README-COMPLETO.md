# 💰 Gil.Finanças PRO - Sistema Completo de Gestão Financeira

Um aplicativo profissional para gerenciamento de empréstimos, clientes, pagamentos e cobranças com interface moderna, cálculo automático de juros e relatórios completos.

---

## 🎯 O QUE FOI CRIADO

### 1️⃣ **FRONTEND (Interface do Usuário)**
- **2 Versões Publicadas:**
  - `app-final-unified.html` - Versão inicial com funcionalidades básicas
  - `app-expanded.html` - Versão completa com tudo (RECOMENDADA)

- **Recursos:**
  - ✅ Login e autenticação segura
  - ✅ Dashboard com estatísticas em tempo real
  - ✅ Gestão completa de clientes (CRUD)
  - ✅ Criação e acompanhamento de empréstimos
  - ✅ Sistema de pagamentos com histórico
  - ✅ Cobranças automáticas e alertas
  - ✅ Calendário de vencimentos interativo
  - ✅ Relatórios com gráficos (Chart.js)
  - ✅ Exportação para CSV, Excel e PDF
  - ✅ Cálculo automático de juros simples e compostos
  - ✅ Design responsivo e profissional
  - ✅ Suporte a múltiplos períodos (diário, semanal, quinzenal, mensal)

### 2️⃣ **BACKEND (API Node.js + Express)**
Arquivo: `server-backend.js`

- **Endpoints Disponíveis:**
  - `POST /auth/register` - Registrar novo usuário
  - `POST /auth/login` - Fazer login
  - `POST /clients` - Criar cliente
  - `GET /clients` - Listar clientes
  - `GET /clients/:id` - Obter cliente específico
  - `PUT /clients/:id` - Atualizar cliente
  - `DELETE /clients/:id` - Deletar cliente
  - `POST /loans` - Criar empréstimo
  - `GET /loans` - Listar empréstimos
  - `GET /loans/:id` - Obter empréstimo com juros calculados
  - `PUT /loans/:id` - Atualizar empréstimo
  - `POST /payments` - Registrar pagamento
  - `GET /payments` - Listar pagamentos
  - `GET /dashboard` - Estatísticas gerais
  - `GET /export/csv` - Exportar dados em CSV
  - `GET /alerts` - Verificar alertas de cobranças

### 3️⃣ **RECURSOS IMPLEMENTADOS**

#### Cálculo de Juros
- **Juros Simples:** J = P × (r/100) × d
- **Juros Compostos:** J = P × (1 + r/100/365)^d - 1
- Período configurável: diário, semanal, quinzenal, mensal

#### Segurança
- ✅ Senha criptografada com bcryptjs
- ✅ Autenticação JWT com tokens expiráveis
- ✅ CORS habilitado
- ✅ Helmet para proteção de headers
- ✅ Validação de entrada

#### Relatórios
- 📊 Dashboard com 4 métricas principais
- 📈 Gráficos de receita mensal
- 📉 Distribuição de empréstimos
- 🗺️ Clientes por região
- 💰 Rentabilidade por cliente
- 📋 Exportação em CSV

---

## 🚀 COMO USAR (PASSO A PASSO)

### **PASSO 1: Instalar Node.js**
1. Baixe em https://nodejs.org
2. Instale a versão LTS

### **PASSO 2: Preparar Pasta do Backend**

```bash
# Crie uma pasta no seu computador
mkdir gil-financas-backend
cd gil-financas-backend

# Copie os arquivos:
# - server-backend.js
# - package-backend.json (renomear para package.json)
# - .env-example (renomear para .env)
```

### **PASSO 3: Instalar Dependências**

```bash
npm install
```

Vai instalar automaticamente:
- express (servidor web)
- cors (permissões entre portas)
- helmet (segurança)
- morgan (logs)
- jsonwebtoken (JWT)
- bcryptjs (criptografia de senha)
- dotenv (variáveis de ambiente)

### **PASSO 4: Iniciar Backend**

```bash
npm start
```

✅ Você deve ver:
```
🚀 Servidor rodando em http://localhost:5000
📦 Ambientes disponíveis:
   - POST /auth/register - Registrar novo usuário
   ...
```

### **PASSO 5: Acessar o Frontend**

**Opção A: Usar a versão publicada (MAIS FÁCIL)**
- Abra o link do Artifact publicado:
  - Versão Inicial: https://claude.ai/artifact/7d5hffg7NFGxRz9S7Ra1TM
  - Versão Expandida: https://claude.ai/artifact/7MSprXjNJmg6rzPCaDnz95

**Opção B: Servir localmente**
1. Salve `app-expanded.html` em uma pasta
2. Abra direto no navegador (duplo clique no arquivo)

### **PASSO 6: Fazer Login**

Use as credenciais de teste:
```
Email: teste@example.com
Senha: Senha123
```

Ou crie uma conta nova registrando no sistema.

---

## 📱 RECURSOS POR PÁGINA

### **Dashboard (Visão Geral)**
- 4 cards com métricas principais
- Gráficos em tempo real
- Resumo de fluxo de recebimentos

### **Clientes**
- ➕ Adicionar novo cliente
- 👥 Ver lista de clientes cadastrados
- 📧 Contato por email/WhatsApp
- 🔄 Editar/deletar cliente

### **Empréstimos**
- 💰 Criar novo empréstimo
- 📊 Taxa de juros customizável
- 📅 Período configurável
- 🧮 Cálculo automático de juros
- ✅ Acompanhar status

### **Pagamentos**
- 💳 Registrar novo pagamento
- 📋 Histórico de pagamentos
- 📊 Métodos de pagamento (dinheiro, PIX, transferência, cheque)
- 📈 Rastreamento de recebimentos

### **Cobranças**
- 🔔 Alertas de vencimento
- ⚠️ Empréstimos atrasados
- 📧 Enviar email de cobrança
- 💬 Enviar mensagem no WhatsApp

### **Calendário**
- 📅 Visualização mensal
- 🎯 Eventos de vencimento destacados
- ⬅️➡️ Navegar entre meses

### **Relatórios**
- 📊 Gráficos de receita
- 📈 Status dos empréstimos
- 💰 Rentabilidade por cliente
- 📥 Exportar em CSV/Excel/PDF

### **Configurações**
- ⚙️ Dados da empresa
- 🔔 Controle de notificações
- 🗑️ Limpar todos os dados

---

## 🧪 TESTE A API COM CURL

### Registrar Novo Usuário
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "SenhaSegura123",
    "name": "Seu Nome",
    "phone": "(11) 99999-9999"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "SenhaSegura123"
  }'
```

Você receberá um `token` - guarde para usar nos próximos endpoints!

### Criar Cliente (use o token recebido)
```bash
curl -X POST http://localhost:5000/clients \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 99999-9999",
    "whatsapp": "(11) 98888-8888",
    "address": "Rua A, 123 - São Paulo"
  }'
```

### Criar Empréstimo
```bash
curl -X POST http://localhost:5000/loans \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "ID_DO_CLIENTE",
    "amount": 2500,
    "rate": 1,
    "period": "diario",
    "interestType": "simple"
  }'
```

### Listar Empréstimos
```bash
curl -X GET http://localhost:5000/loans \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Dashboard
```bash
curl -X GET http://localhost:5000/dashboard \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🔌 INTEGRAÇÃO FRONTEND ↔ BACKEND

O frontend (app-expanded.html) pode ser facilmente integrado ao backend:

### Adicionar chamadas API ao Frontend:

```javascript
// No frontend, adicione ao função de login:
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha })
    });
    
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        // Ir para dashboard
    }
}
```

---

## 🔒 VARIÁVEIS DE AMBIENTE

Crie um arquivo `.env` na pasta do backend:

```
PORT=5000
JWT_SECRET=sua_chave_super_secreta_2026
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=sua_senha
```

---

## 📦 PRÓXIMOS PASSOS

Para melhorias futuras:

1. **Banco de Dados Real**
   - Instalar PostgreSQL
   - Usar pool de conexão (`pg`)
   - Migrações automáticas

2. **WhatsApp/Email Automático**
   - Integrar Twilio (WhatsApp)
   - Integrar SendGrid (Email)
   - Webhooks para eventos

3. **Mobile App**
   - React Native ou Flutter
   - App iOS e Android

4. **Assinatura/Planos**
   - Integrar Stripe
   - Diferentes níveis de acesso

5. **Análises Avançadas**
   - Machine Learning para previsão
   - Gráficos customizáveis

---

## 🛠️ TROUBLESHOOTING

### ❌ "npm command not found"
→ Node.js não está instalado. Baixe em https://nodejs.org

### ❌ "Porta 5000 já em uso"
→ Mude em server-backend.js: `const PORT = 5001;`

### ❌ "CORS error"
→ CORS já está configurado no backend, não precisa fazer nada

### ❌ "Token inválido"
→ Faça login novamente para obter um novo token

### ❌ "Conexão recusada"
→ Verifique se o servidor está rodando: `npm start`

---

## 📚 ARQUITETURA

```
Gil.Finanças/
├── Frontend
│   ├── app-final-unified.html (v1)
│   └── app-expanded.html (v2 - COMPLETA)
│
├── Backend
│   ├── server-backend.js (API Node.js)
│   ├── package-backend.json
│   └── .env (variáveis de ambiente)
│
├── Docs
│   └── README-COMPLETO.md (você está aqui!)
```

---

## 📞 CONTATO & SUPORTE

Para dúvidas ou melhorias:
1. Verifique o console (F12) para erros
2. Veja os logs do servidor
3. Consulte a documentação da API

---

## ✅ CHECKLIST FINAL

- [x] Frontend com interface completa
- [x] Backend com autenticação JWT
- [x] CRUD de clientes
- [x] CRUD de empréstimos
- [x] Cálculo de juros simples e compostos
- [x] Sistema de pagamentos
- [x] Relatórios e gráficos
- [x] Exportação de dados
- [x] Sistema de alertas
- [x] Design responsivo
- [x] Segurança implementada

**Próximas fases:**
- [ ] PostgreSQL real
- [ ] WhatsApp integration
- [ ] Email automático
- [ ] App mobile
- [ ] Análises ML

---

🎉 **Parabéns! Você tem um sistema profissional de gestão financeira!**

Comece agora:
```bash
npm install && npm start
```

Depois acesse: https://claude.ai/artifact/7MSprXjNJmg6rzPCaDnz95
