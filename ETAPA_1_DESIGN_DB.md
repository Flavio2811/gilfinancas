# 📐 ETAPA 1: DESIGN & BANCO DE DADOS

## **PARTE A: FLUXO DE NAVEGAÇÃO E PROTOTIPAGEM**

### **1. Tela de Login (Primeira Página)**

```
┌─────────────────────────────────────┐
│                                     │
│     SISTEMA DE CONTROLE FINANCEIRO  │
│        (Logo/Nome da Empresa)       │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Email:   [________________]   │  │
│  │ Senha:   [________________]   │  │
│  │                               │  │
│  │  ☐ Manter conectado          │  │
│  │                               │  │
│  │       [  ENTRAR  ]            │  │
│  │                               │  │
│  │  Esqueceu a senha?            │  │
│  │  Recuperar Conta              │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### **2. Tela de Recuperação de Conta (Backup de Senha)**

```
┌─────────────────────────────────────┐
│  ← Voltar                           │
│  RECUPERAR CONTA                    │
├─────────────────────────────────────┤
│                                     │
│  Escolha a forma de recuperação:    │
│                                     │
│  ○ Recuperar via EMAIL              │
│    Enviaremos um código para seu    │
│    email cadastrado                 │
│                                     │
│  ○ Recuperar via TELEFONE           │
│    Enviaremos um código SMS para    │
│    seu telefone                     │
│                                     │
│      [  PRÓXIMO  ]                  │
│                                     │
└─────────────────────────────────────┘
```

### **3. Tela Principal - Dashboard (HOME)**

```
┌──────────────────────────────────────────────────────────┐
│  🏠 HOME │ 👥 CLIENTES │ 💰 EMPRÉSTIMOS │ 📊 RELATÓRIOS │ ⚙️
├──────────────────────────────────────────────────────────┤
│                                                          │
│  BEM-VINDO! [Nome do Dono]                             │
│                                                          │
│  ┌─ DASHBOARD PERSONALIZADO ────────────────────┐      │
│  │ [+] Adicionar Widget                          │      │
│  │ [↔️] Organizar / [×] Remover                  │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │ TOTAL EMPRESTADO    │  │ TOTAL RECEBIDO      │      │
│  │   R$ 15.500,00      │  │   R$ 8.200,00       │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │ SALDO A RECEBER     │  │ CLIENTES ATIVOS     │      │
│  │   R$ 7.300,00       │  │        23           │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ ÚLTIMOS EMPRÉSTIMOS                            │    │
│  │ Cliente │ Valor │ Taxa │ Status │ Data        │    │
│  │─────────┼───────┼──────┼────────┼─────────── │    │
│  │ João    │ 1000  │ 1%/d │ Ativo  │ 10/10/26   │    │
│  │ Maria   │ 500   │ 2%/s │ Atrasado│ 08/10/26  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### **4. Tela de Clientes**

```
┌──────────────────────────────────────────────────────────┐
│  🏠 HOME │ 👥 CLIENTES │ 💰 EMPRÉSTIMOS │ 📊 RELATÓRIOS │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [+ NOVO CLIENTE]  [🔍 Buscar...]                      │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Cliente │ Email │ Telefone │ Status │ Ações  │    │
│  │─────────┼───────┼──────────┼────────┼────── │    │
│  │ João M. │ j@... │ 11 98... │ Ativo  │ ✏️ 👁️│    │
│  │ Maria S.│ m@... │ 21 99... │ Ativo  │ ✏️ 👁️│    │
│  │ Pedro L.│ p@... │ 85 98... │ Inativo│ ✏️ 👁️│    │
│  │ Ana C.  │ a@... │ 47 99... │ Ativo  │ ✏️ 👁️│    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### **5. Tela de Empréstimos**

```
┌──────────────────────────────────────────────────────────┐
│  🏠 HOME │ 👥 CLIENTES │ 💰 EMPRÉSTIMOS │ 📊 RELATÓRIOS │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [+ NOVO EMPRÉSTIMO]  Filtrar: [Todos ▼]              │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Cliente │ Valor │ Taxa │ Status │ Vencimento │    │
│  │─────────┼───────┼──────┼────────┼──────────│    │
│  │ João    │ 1000  │ 1%/d │ ✅Ativo│ 15/10/26│    │
│  │ Maria   │ 500   │ 2%/s │ ⏰Atrasado│ 08/10/26 │
│  │ Pedro   │ 2000  │ 1%/d │ ✅Ativo│ 20/10/26│    │
│  │ Ana     │ 750   │ 1%/d │ ✅Pago │ 09/10/26│    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### **6. Tela de Relatórios**

```
┌──────────────────────────────────────────────────────────┐
│  🏠 HOME │ 👥 CLIENTES │ 💰 EMPRÉSTIMOS │ 📊 RELATÓRIOS │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Período: [Diário ▼] [Jan ▼] [2026 ▼]  [Gerar]       │
│                                                          │
│  ╔════════════════════════════════════════════╗        │
│  ║  GRÁFICO - Empréstimos vs Pagamentos      ║        │
│  ║  (Gráfico de barras)                      ║        │
│  ╚════════════════════════════════════════════╝        │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Total Emprestado: R$ 15.500                  │    │
│  │ Total Recebido: R$ 8.200                     │    │
│  │ Total em Aberto: R$ 7.300                    │    │
│  │ Taxa de Inadimplência: 5%                    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [📥 Exportar Relatório]  [🖨️ Imprimir]              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### **7. Tela de Configurações (Painel do Dono)**

```
┌──────────────────────────────────────────────────────────┐
│  🏠 HOME │ 👥 CLIENTES │ 💰 EMPRÉSTIMOS │ ⚙️ CONFIGURAÇÕES
├──────────────────────────────────────────────────────────┤
│                                                          │
│  GERAIS                                                 │
│  ├─ Nome da Empresa: [_________________]               │
│  ├─ Email: [_________________]                         │
│  ├─ Telefone: [_________________]                      │
│                                                          │
│  JUROS                                                  │
│  ├─ Tipo: ○ Simples  ○ Compostos                      │
│  ├─ Taxa Padrão: [1] % por [Diário ▼]                │
│  ├─ Juros variam por cliente? ○ Sim ○ Não            │
│  ├─ Juros de Atraso: [0.5] %                          │
│                                                          │
│  PAGAMENTOS                                             │
│  ├─ Permitir pagamentos parciais? ○ Sim ○ Não         │
│  ├─ Data de pagamento: ○ Qualquer ○ Específica       │
│                                                          │
│  LEMBRETES                                              │
│  ├─ Ativar lembretes WhatsApp? ○ Sim ○ Não           │
│  ├─ Ativar lembretes Email? ○ Sim ○ Não              │
│  ├─ Frequência: [Quando vencer ▼]                     │
│                                                          │
│  SEGURANÇA                                              │
│  ├─ Alterar Senha                                      │
│  ├─ Autenticação de Dois Fatores (2FA)                │
│                                                          │
│  [💾 SALVAR]                                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## **PARTE B: ESTRUTURA DO BANCO DE DADOS**

### **1. Tabela: Usuários (Autenticação & Login)**

```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL, -- bcrypt
    telefone VARCHAR(20) NOT NULL,
    nome_empresa VARCHAR(255),
    nome_dono VARCHAR(255) NOT NULL,
    status ENUM('ativo', 'inativo', 'bloqueado') DEFAULT 'ativo',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_ultimo_login TIMESTAMP,
    autenticacao_2fa BOOLEAN DEFAULT FALSE,
    codigo_2fa VARCHAR(6),
    data_expiracao_2fa TIMESTAMP,
    
    -- Recuperação de Conta
    token_recuperacao VARCHAR(255) UNIQUE,
    data_expiracao_token TIMESTAMP,
    tentativas_fallidas INT DEFAULT 0,
    bloqueado_ate TIMESTAMP
);
```

### **2. Tabela: Configurações (Personalizável por Dono)**

```sql
CREATE TABLE configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Juros
    tipo_juros ENUM('simples', 'compostos') DEFAULT 'simples',
    taxa_padrao DECIMAL(5,2) DEFAULT 1.0,
    tipo_periodo ENUM('diario', 'semanal', 'quinzenal', 'mensal') DEFAULT 'diario',
    juros_variam_por_cliente BOOLEAN DEFAULT FALSE,
    juros_atraso DECIMAL(5,2) DEFAULT 0.5,
    cobra_juros_sem_periodo_completo BOOLEAN DEFAULT TRUE,
    
    -- Pagamentos
    permitir_pagamentos_parciais BOOLEAN DEFAULT TRUE,
    data_pagamento_especifica BOOLEAN DEFAULT FALSE,
    
    -- Lembretes
    ativar_whatsapp BOOLEAN DEFAULT FALSE,
    ativar_email BOOLEAN DEFAULT FALSE,
    frequencia_lembretes ENUM('diario', 'quando_vencer', 'quando_atrasar') DEFAULT 'quando_vencer',
    
    -- Segurança
    ativar_2fa BOOLEAN DEFAULT FALSE,
    
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **3. Tabela: Widget do Dashboard (Customização)**

```sql
CREATE TABLE widgets_dashboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    tipo_widget VARCHAR(100) NOT NULL, -- Ex: 'total_emprestado', 'clientes_ativos', 'gráfico_receita'
    titulo VARCHAR(255) NOT NULL,
    posicao INT DEFAULT 1, -- Ordem de exibição
    tamanho ENUM('pequeno', 'medio', 'grande') DEFAULT 'medio',
    ativado BOOLEAN DEFAULT TRUE,
    configuracoes JSONB, -- Dados específicos do widget
    
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **4. Tabela: Clientes**

```sql
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco TEXT,
    
    status ENUM('ativo', 'inativo', 'inadimplente') DEFAULT 'ativo',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT email_valido CHECK (email LIKE '%@%')
);
```

### **5. Tabela: Empréstimos**

```sql
CREATE TABLE emprestimos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    
    valor DECIMAL(12,2) NOT NULL,
    taxa_juros DECIMAL(5,2) NOT NULL, -- Pode variar por cliente
    tipo_juros ENUM('simples', 'compostos'),
    tipo_periodo ENUM('diario', 'semanal', 'quinzenal', 'mensal'),
    
    data_emprestimo DATE NOT NULL,
    data_vencimento DATE,
    data_quitacao DATE,
    
    status ENUM('ativo', 'vencido', 'pago', 'cancelado') DEFAULT 'ativo',
    juros_acumulados DECIMAL(12,2) DEFAULT 0,
    saldo_devedor DECIMAL(12,2) NOT NULL,
    
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **6. Tabela: Pagamentos**

```sql
CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    emprestimo_id UUID NOT NULL REFERENCES emprestimos(id) ON DELETE RESTRICT,
    
    valor_pago DECIMAL(12,2) NOT NULL,
    valor_juros_pago DECIMAL(12,2) DEFAULT 0,
    saldo_devedor_apos DECIMAL(12,2),
    
    data_pagamento DATE NOT NULL,
    tipo_pagamento ENUM('total', 'parcial') DEFAULT 'parcial',
    
    metodo ENUM('dinheiro', 'pix', 'transferencia', 'outro') DEFAULT 'outro',
    observacoes TEXT,
    
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **7. Tabela: Lembretes (Histórico)**

```sql
CREATE TABLE lembretes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    emprestimo_id UUID NOT NULL REFERENCES emprestimos(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    
    tipo ENUM('whatsapp', 'email', 'sms') NOT NULL,
    motivo ENUM('vencimento', 'atraso', 'lembrete_diario') NOT NULL,
    
    mensagem TEXT NOT NULL,
    enviado BOOLEAN DEFAULT FALSE,
    data_envio TIMESTAMP,
    
    status_resposta VARCHAR(100), -- 'sucesso', 'falha', 'nao_entregue'
    
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **8. Tabela: Auditoria (Registro de Ações)**

```sql
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    acao VARCHAR(100) NOT NULL, -- 'login', 'criar_emprestimo', 'registrar_pagamento'
    tabela_afetada VARCHAR(100),
    id_registro UUID,
    
    dados_anteriores JSONB, -- Antes da mudança
    dados_novos JSONB,      -- Depois da mudança
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **9. Tabela: Recuperação de Conta (Tokens & Códigos)**

```sql
CREATE TABLE recuperacao_conta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    tipo_recuperacao ENUM('email', 'telefone') NOT NULL,
    codigo_confirmacao VARCHAR(6) NOT NULL, -- Código de 6 dígitos
    token_segurança VARCHAR(255) UNIQUE, -- Token para reset de senha
    
    tentativas INT DEFAULT 0,
    bloqueado BOOLEAN DEFAULT FALSE,
    bloqueado_ate TIMESTAMP,
    
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 minutes'
);
```

---

## **PARTE C: FLUXO DE AUTENTICAÇÃO**

### **1. Registro (Primeira Vez)**

```
PÁGINA DE REGISTRO
├─ Email
├─ Senha (min 8 caracteres, 1 maiúscula, 1 número)
├─ Confirmar Senha
├─ Nome do Dono
├─ Telefone
├─ Nome da Empresa (opcional)
└─ [CRIAR CONTA]
    ↓
VALIDAÇÃO
├─ Email já existe? Mostrar erro
├─ Senha fraca? Mostrar sugestões
└─ Tudo OK? Criar usuário + Configurações padrão
    ↓
ENVIAR EMAIL DE CONFIRMAÇÃO
├─ Código de 6 dígitos
├─ Link para confirmar email
└─ Válido por 24 horas
    ↓
USUÁRIO CONFIRMA
└─ Conta ativada! Pode fazer login
```

### **2. Login (Acesso)**

```
LOGIN
├─ Email: [_________]
├─ Senha: [_________]
└─ [ENTRAR]
    ↓
VALIDAÇÃO
├─ Email existe?
├─ Senha correta?
├─ Conta ativa?
└─ 2FA ativado?
    ↓
SEM 2FA → DASHBOARD
COM 2FA → ENVIAR CÓDIGO
    ├─ SMS/Email
    └─ Inserir código [______] [CONFIRMAR]
        ↓
    → DASHBOARD
```

### **3. Recuperação de Senha**

```
PÁGINA DE LOGIN
  └─ "Esqueceu a senha?"
      ↓
ESCOLHER MÉTODO
├─ ○ Recuperar via EMAIL
├─ ○ Recuperar via TELEFONE
└─ [PRÓXIMO]
    ↓
ENVIAR CÓDIGO
├─ Email: "Enviamos um código para seu email"
├─ OU Telefone: "Enviamos um SMS para seu telefone"
└─ Válido por 30 minutos
    ↓
INSERIR CÓDIGO
├─ Código: [______] [______] [______] (6 dígitos)
└─ [CONFIRMAR]
    ↓
DEFINIR NOVA SENHA
├─ Nova Senha: [_________________]
├─ Confirmar: [_________________]
└─ [ATUALIZAR]
    ↓
✅ SUCESSO! Pode fazer login com nova senha
```

### **4. Autenticação de Dois Fatores (2FA) - Opcional**

```
CONFIGURAÇÕES → SEGURANÇA
├─ Ativar Autenticação de Dois Fatores (2FA)?
├─ Escanear QR Code com Google Authenticator
├─ Ou inserir chave manualmente
└─ [ATIVAR 2FA]
    ↓
PRÓXIMOS LOGINS EXIGIRÃO CÓDIGO DE 6 DÍGITOS
```

---

## **PARTE D: LISTA DE WIDGETS PARA DASHBOARD**

O usuário pode escolher entre estes widgets:

| Widget | Descrição | Tamanho |
|--------|-----------|--------|
| **Total Emprestado** | Soma de todos os empréstimos | Pequeno |
| **Total Recebido** | Soma de todos os pagamentos | Pequeno |
| **Saldo em Aberto** | Diferença entre emprestado e recebido | Pequeno |
| **Clientes Ativos** | Quantidade de clientes com empréstimos | Pequeno |
| **Taxa de Inadimplência** | % de empréstimos em atraso | Pequeno |
| **Últimos Empréstimos** | Tabela dos 5 últimos | Grande |
| **Últimos Pagamentos** | Tabela dos 5 últimos | Grande |
| **Gráfico - Receita** | Gráfico de barras por período | Grande |
| **Gráfico - Tipos Juros** | Pizza com distribuição de juros | Médio |
| **Clientes com Atraso** | Tabela de inadimplentes | Médio |
| **Resumo do Mês** | Total emprestado, recebido, saldo | Médio |

---

## **✅ CHECKLIST - ETAPA 1**

- [x] Prototipagem de todas as telas
- [x] Schema completo do banco de dados
- [x] Sistema de autenticação (login/senha)
- [x] Sistema de recuperação de conta (email/telefone)
- [x] Sistema de 2FA (autenticação de dois fatores)
- [x] Sistema de widgets customizáveis
- [x] Auditoria de ações
- [x] Tabelas de clientes, empréstimos, pagamentos, lembretes

---

## **PRÓXIMOS PASSOS**

✅ **ETAPA 1 COMPLETA!**

→ Próximo: **ETAPA 2 - Backend (API)**
  - Criar servidor Node.js + Express
  - Implementar endpoints de autenticação
  - Implementar endpoints CRUD de clientes, empréstimos, pagamentos
  - Implementar cálculos automáticos de juros
  - Testes dos endpoints
