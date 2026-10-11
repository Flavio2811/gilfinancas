# 🚀 Setup: Gil.Finanças com Supabase

## ✅ O QUE VOCÊ JÁ TEM:

- ✅ Backend com integração Supabase (`server-supabase.js`)
- ✅ 4 tabelas criadas no Supabase (usuarios, clientes, emprestimos, pagamentos)
- ✅ API REST pronta para usar
- ✅ Package.json atualizado com dependência Supabase

---

## 📋 PASSO 1: Pegar as Credenciais do Supabase

### No navegador, já na aba do Supabase:

1. Clique em **Settings** (engrenagem no canto inferior esquerdo)
2. Selecione **API** no menu esquerdo
3. Procure por **"Project API Keys"**
4. Copie **"ANON PUBLIC KEY"** (é a chave que começa com `eyJ...`)

Ou acesse diretamente: https://app.supabase.com/project/rslhrihbvzoeilkmjbwh/settings/api

---

## 🔑 PASSO 2: Configurar o Arquivo .env

1. Abra/crie um arquivo chamado `.env` na pasta do backend
2. Cole esse conteúdo (substituindo AQUI_COLE_A_ANON_PUBLIC_KEY):

```env
# SERVIDOR
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui_2026

# SUPABASE
SUPABASE_URL=https://rslhrihbvzoeilkmjbwh.supabase.co
SUPABASE_KEY=AQUI_COLE_A_ANON_PUBLIC_KEY

# LOGS
LOG_LEVEL=debug
```

3. Salve o arquivo como `.env` (SEM a extensão .example)

---

## 📦 PASSO 3: Instalar Dependências

Abra um terminal na pasta do backend e rode:

```bash
npm install
```

Isso vai instalar todas as dependências, incluindo:
- express
- @supabase/supabase-js
- bcryptjs
- jsonwebtoken
- cors
- helmet
- morgan

---

## ▶️ PASSO 4: Rodar o Servidor

```bash
npm start
```

Você deve ver uma mensagem assim:

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║    🚀 GIL.FINANÇAS Backend (Supabase) rodando! 🚀         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📍 Servidor: http://localhost:5000
📊 Supabase Project: https://rslhrihbvzoeilkmjbwh.supabase.co

✅ Endpoints disponíveis:
   POST   /auth/register        - Registrar usuário
   POST   /auth/login           - Fazer login
   POST   /clients              - Criar cliente
   GET    /clients              - Listar clientes
   GET    /clients/:id          - Obter cliente
   PUT    /clients/:id          - Atualizar cliente
   DELETE /clients/:id          - Deletar cliente
   POST   /loans                - Criar empréstimo
   GET    /loans                - Listar empréstimos
   GET    /loans/:id            - Obter empréstimo
   POST   /payments             - Registrar pagamento
   GET    /payments             - Listar pagamentos
   GET    /dashboard            - Dashboard com estatísticas
```

---

## 🧪 PASSO 5: Testar a API

### Registrar um usuário:

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "Senha123",
    "name": "Seu Nome",
    "phone": "(11) 99999-9999"
  }'
```

A resposta vai ter um `token`. Guarde esse token!

### Login:

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "Senha123"
  }'
```

### Criar um cliente (use o token):

```bash
curl -X POST http://localhost:5000/clients \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 98765-4321"
  }'
```

---

## ✨ CONECTAR FRONTEND

O frontend (app-expanded.html) já está pronto! Só precisa:

1. Trocar `http://localhost:3000` por `http://localhost:5000` na URL base da API
2. Rodar o servidor backend
3. Abrir o frontend
4. Testar login e criar dados

---

## 🆘 PROBLEMAS COMUNS

### ❌ "Port 5000 already in use"
Solução: Abra outro terminal ou mude a porta no .env para 5001

### ❌ "SUPABASE_KEY not configured"
Solução: Copie a Anon Public Key corretamente no .env

### ❌ "Cannot find module '@supabase/supabase-js'"
Solução: Rode `npm install` novamente

### ❌ "Email já registrado"
Solução: Use outro email para registrar ou delete o usuário no Supabase

---

## 📚 PRÓXIMOS PASSOS

1. ✅ Backend com Supabase rodando
2. ⬜ Testar todos os endpoints
3. ⬜ Conectar frontend ao backend
4. ⬜ Testar fluxo completo (registrar → criar cliente → criar empréstimo → pagar)
5. ⬜ Adicionar features extras (WhatsApp, Email, etc)

---

## 📞 AJUDA

Se tiver dúvidas:
1. Verifique se Supabase está rodando (ping https://rslhrihbvzoeilkmjbwh.supabase.co)
2. Verifique o console do servidor (tem logs de erro)
3. Verifique se a porta 5000 está aberta (firewall)
4. Verifique se o .env está na pasta correta

---

**Pronto! Seu backend está integrado com Supabase! 🎉**
