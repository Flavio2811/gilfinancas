-- ===== TABELAS DO GIL.FINANÇAS NO SUPABASE =====

-- Tabela de Usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  address VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Empréstimos
CREATE TABLE emprestimos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  rate DECIMAL(5, 2) NOT NULL,
  period VARCHAR(20) NOT NULL,
  interest_type VARCHAR(20) DEFAULT 'simple',
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Pagamentos
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES emprestimos(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP NOT NULL,
  method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'confirmado',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_clientes_user_id ON clientes(user_id);
CREATE INDEX idx_emprestimos_user_id ON emprestimos(user_id);
CREATE INDEX idx_emprestimos_client_id ON emprestimos(client_id);
CREATE INDEX idx_pagamentos_user_id ON pagamentos(user_id);
CREATE INDEX idx_pagamentos_loan_id ON pagamentos(loan_id);
