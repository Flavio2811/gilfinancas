CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    nome_dono VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco TEXT,
    status VARCHAR(50) DEFAULT 'ativo',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emprestimos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    valor DECIMAL(12,2) NOT NULL,
    taxa_juros DECIMAL(5,2) NOT NULL,
    tipo_juros VARCHAR(50) DEFAULT 'simples',
    tipo_periodo VARCHAR(50) DEFAULT 'diario',
    data_emprestimo DATE NOT NULL,
    data_vencimento DATE,
    status VARCHAR(50) DEFAULT 'ativo',
    juros_acumulados DECIMAL(12,2) DEFAULT 0,
    saldo_devedor DECIMAL(12,2),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    emprestimo_id INTEGER NOT NULL REFERENCES emprestimos(id),
    valor_pago DECIMAL(12,2) NOT NULL,
    data_pagamento DATE NOT NULL,
    tipo_pagamento VARCHAR(50) DEFAULT 'parcial',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE widgets_dashboard (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tipo_widget VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    posicao INT DEFAULT 1,
    ativado BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_clientes_usuario ON clientes(usuario_id);
CREATE INDEX idx_emprestimos_usuario ON emprestimos(usuario_id);
CREATE INDEX idx_emprestimos_cliente ON emprestimos(cliente_id);
CREATE INDEX idx_pagamentos_emprestimo ON pagamentos(emprestimo_id);
