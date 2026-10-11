const express = require('express');
const router = express.Router();
const pool = require('../database');
const { authenticateToken } = require('../middleware');

function calcularJuros(valor, taxa, tipoJuros, diasDecorridos) {
  if (tipoJuros === 'simples') {
    return valor * (taxa / 100) * diasDecorridos;
  } else {
    const montante = valor * Math.pow(1 + (taxa / 100), diasDecorridos);
    return montante - valor;
  }
}

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { cliente_id, valor, taxa_juros, tipo_juros, tipo_periodo, data_vencimento } = req.body;
    const userId = req.userId;
    const data_emprestimo = new Date().toISOString().split('T')[0];

    const saldoDevedor = valor;

    const result = await pool.query(
      'INSERT INTO emprestimos (usuario_id, cliente_id, valor, taxa_juros, tipo_juros, tipo_periodo, data_emprestimo, data_vencimento, saldo_devedor) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [userId, cliente_id, valor, taxa_juros, tipo_juros, tipo_periodo, data_emprestimo, data_vencimento, saldoDevedor]
    );

    res.status(201).json({ success: true, emprestimo: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      'SELECT e.*, c.nome as cliente_nome FROM emprestimos e JOIN clientes c ON e.cliente_id = c.id WHERE e.usuario_id = $1 ORDER BY e.data_criacao DESC',
      [userId]
    );

    res.json({ success: true, emprestimos: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = await pool.query(
      'SELECT e.*, c.nome as cliente_nome FROM emprestimos e JOIN clientes c ON e.cliente_id = c.id WHERE e.id = $1 AND e.usuario_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    const emprestimo = result.rows[0];
    const dataEmprestimo = new Date(emprestimo.data_emprestimo);
    const hoje = new Date();
    const diasDecorridos = Math.floor((hoje - dataEmprestimo) / (1000 * 60 * 60 * 24));

    const jurosAcumulados = calcularJuros(
      emprestimo.valor,
      emprestimo.taxa_juros,
      emprestimo.tipo_juros,
      diasDecorridos
    );

    res.json({
      success: true,
      emprestimo: {
        ...emprestimo,
        juros_acumulados: jurosAcumulados,
        saldo_devedor: emprestimo.valor + jurosAcumulados
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    const result = await pool.query(
      'UPDATE emprestimos SET status = $1 WHERE id = $2 AND usuario_id = $3 RETURNING *',
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    res.json({ success: true, emprestimo: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
