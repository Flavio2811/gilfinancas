const express = require('express');
const router = express.Router();
const pool = require('../database');
const { authenticateToken } = require('../middleware');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { emprestimo_id, valor_pago, tipo_pagamento } = req.body;
    const userId = req.userId;
    const data_pagamento = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      'INSERT INTO pagamentos (usuario_id, emprestimo_id, valor_pago, data_pagamento, tipo_pagamento) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, emprestimo_id, valor_pago, data_pagamento, tipo_pagamento]
    );

    res.status(201).json({ success: true, pagamento: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/emprestimo/:emprestimo_id', authenticateToken, async (req, res) => {
  try {
    const { emprestimo_id } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      'SELECT p.* FROM pagamentos p JOIN emprestimos e ON p.emprestimo_id = e.id WHERE p.emprestimo_id = $1 AND e.usuario_id = $2 ORDER BY p.data_pagamento DESC',
      [emprestimo_id, userId]
    );

    res.json({ success: true, pagamentos: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      'SELECT p.*, e.cliente_id, c.nome FROM pagamentos p JOIN emprestimos e ON p.emprestimo_id = e.id JOIN clientes c ON e.cliente_id = c.id WHERE p.usuario_id = $1 ORDER BY p.data_pagamento DESC',
      [userId]
    );

    res.json({ success: true, pagamentos: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
