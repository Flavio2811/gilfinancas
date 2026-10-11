import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [page, setPage] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [clientes, setClientes] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (token) {
      setPage('dashboard');
      loadClientes();
      loadEmprestimos();
    }
  }, [token]);

  const loadClientes = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(response.data.clientes || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadEmprestimos = async () => {
    try {
      const response = await axios.get(`${API_URL}/loans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmprestimos(response.data.emprestimos || []);
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setPage('dashboard');
    } catch (error) {
      alert('Erro ao fazer login: ' + error.response?.data?.error);
    }
    setLoading(false);
  };

  const handleRegister = async (email, password, nome_dono, telefone) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        nome_dono,
        telefone
      });
      alert('Cadastro realizado! Faça login agora.');
      setPage('login');
    } catch (error) {
      alert('Erro ao registrar: ' + error.response?.data?.error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setPage('login');
  };

  const handleAddCliente = async (nome, email, telefone, whatsapp, endereco) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/clients`,
        { nome, email, telefone, whatsapp, endereco },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadClientes();
      alert('Cliente adicionado com sucesso!');
    } catch (error) {
      alert('Erro ao adicionar cliente: ' + error.response?.data?.error);
    }
    setLoading(false);
  };

  const handleAddEmprestimo = async (cliente_id, valor, taxa_juros, tipo_juros, tipo_periodo) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/loans`,
        { cliente_id: parseInt(cliente_id), valor: parseFloat(valor), taxa_juros: parseFloat(taxa_juros), tipo_juros, tipo_periodo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadEmprestimos();
      alert('Empréstimo criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar empréstimo: ' + error.response?.data?.error);
    }
    setLoading(false);
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} setPage={setPage} page={page} loading={loading} />;
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <h1>💰 Controle Financeiro</h1>
        <div className="nav-buttons">
          <button onClick={() => setPage('dashboard')} className={page === 'dashboard' ? 'active' : ''}>Dashboard</button>
          <button onClick={() => setPage('clientes')} className={page === 'clientes' ? 'active' : ''}>Clientes</button>
          <button onClick={() => setPage('emprestimos')} className={page === 'emprestimos' ? 'active' : ''}>Empréstimos</button>
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </nav>

      <div className="main-content">
        {page === 'dashboard' && <DashboardPage clientes={clientes} emprestimos={emprestimos} />}
        {page === 'clientes' && <ClientesPage clientes={clientes} onAddCliente={handleAddCliente} loading={loading} />}
        {page === 'emprestimos' && <EmprestimosPage emprestimos={emprestimos} clientes={clientes} onAddEmprestimo={handleAddEmprestimo} loading={loading} />}
      </div>
    </div>
  );
}

function LoginPage({ onLogin, onRegister, setPage, page, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome_dono, setNomeDono] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (page === 'login') {
      onLogin(email, password);
    } else {
      onRegister(email, password, nome_dono, telefone);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{page === 'login' ? 'Fazer Login' : 'Criar Conta'}</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {page === 'register' && (
            <>
              <input type="text" placeholder="Nome completo" value={nome_dono} onChange={(e) => setNomeDono(e.target.value)} required />
              <input type="tel" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
            </>
          )}
          <button type="submit" disabled={loading}>{loading ? 'Carregando...' : (page === 'login' ? 'Entrar' : 'Cadastrar')}</button>
        </form>
        <p>
          {page === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <a onClick={() => setPage(page === 'login' ? 'register' : 'login')}>
            {page === 'login' ? 'Criar agora' : 'Fazer login'}
          </a>
        </p>
      </div>
    </div>
  );
}

function DashboardPage({ clientes, emprestimos }) {
  const totalEmprestado = emprestimos.reduce((sum, e) => sum + parseFloat(e.valor || 0), 0);
  const emprestimosAtivos = emprestimos.filter(e => e.status === 'ativo').length;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Emprestado</h3>
          <p className="big-number">R$ {totalEmprestado.toFixed(2)}</p>
        </div>
        <div className="dashboard-card">
          <h3>Empréstimos Ativos</h3>
          <p className="big-number">{emprestimosAtivos}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total de Clientes</h3>
          <p className="big-number">{clientes.length}</p>
        </div>
      </div>
    </div>
  );
}

function ClientesPage({ clientes, onAddCliente, loading }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [endereco, setEndereco] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddCliente(nome, email, telefone, whatsapp, endereco);
    setNome('');
    setEmail('');
    setTelefone('');
    setWhatsapp('');
    setEndereco('');
  };

  return (
    <div className="clients-page">
      <h2>Clientes</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="tel" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <input type="tel" placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        <input type="text" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Adicionando...' : 'Adicionar Cliente'}</button>
      </form>

      <div className="clients-list">
        {clientes.length === 0 ? (
          <p>Nenhum cliente ainda</p>
        ) : (
          clientes.map(cliente => (
            <div key={cliente.id} className="client-card">
              <h4>{cliente.nome}</h4>
              <p>📧 {cliente.email}</p>
              <p>📱 {cliente.telefone}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EmprestimosPage({ emprestimos, clientes, onAddEmprestimo, loading }) {
  const [cliente_id, setClienteId] = useState('');
  const [valor, setValor] = useState('');
  const [taxa_juros, setTaxaJuros] = useState('1');
  const [tipo_juros, setTipoJuros] = useState('simples');
  const [tipo_periodo, setTipoPeriodo] = useState('diario');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddEmprestimo(cliente_id, valor, taxa_juros, tipo_juros, tipo_periodo);
    setClienteId('');
    setValor('');
    setTaxaJuros('1');
  };

  return (
    <div className="loans-page">
      <h2>Empréstimos</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <select value={cliente_id} onChange={(e) => setClienteId(e.target.value)} required>
          <option value="">Selecione um cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <input type="number" placeholder="Valor" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
        <input type="number" placeholder="Taxa de Juros (%)" step="0.1" value={taxa_juros} onChange={(e) => setTaxaJuros(e.target.value)} required />
        <select value={tipo_juros} onChange={(e) => setTipoJuros(e.target.value)}>
          <option value="simples">Juros Simples</option>
          <option value="compostos">Juros Compostos</option>
        </select>
        <select value={tipo_periodo} onChange={(e) => setTipoPeriodo(e.target.value)}>
          <option value="diario">Diário</option>
          <option value="semanal">Semanal</option>
          <option value="quinzenal">Quinzenal</option>
          <option value="mensal">Mensal</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar Empréstimo'}</button>
      </form>

      <div className="loans-list">
        {emprestimos.length === 0 ? (
          <p>Nenhum empréstimo ainda</p>
        ) : (
          emprestimos.map(emp => (
            <div key={emp.id} className="loan-card">
              <h4>{emp.cliente_nome}</h4>
              <p>💰 R$ {parseFloat(emp.valor).toFixed(2)}</p>
              <p>📊 {emp.taxa_juros}% {emp.tipo_periodo}</p>
              <p>✅ Status: {emp.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
