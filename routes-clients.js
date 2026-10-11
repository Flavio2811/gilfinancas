const express = require('express');
const router = express.Router();
const pool = require('../database');
const { authenticateToken } = require('../middleware');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nome, email, telefone, whatsapp, endereco } = req.body;
    const userId = req.userId;

    const result = await pool.query(
      'INSERT INTO clientes (usuario_id, nome, email, telefone, whatsapp, endereco) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, nome, email, telefone, whatsapp, endereco]
    );

    res.status(201).json({ success: true, cliente: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query('SELECT * FROM clientes WHERE usuario_id = $1 ORDER BY data_cadastro DESC', [userId]);
    res.json({ success: true, clientes: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1 AND usuario_id = $2', [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ success: true, cliente: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { nome, email, telefone, whatsapp, endereco } = req.body;

    const result = await pool.query(
      'UPDATE clientes SET nome = $1, email = $2, telefone = $3, whatsapp = $4, endereco = $5 WHERE id = $6 AND usuario_id = $7 RETURNING *',
      [nome, email, telefone, whatsapp, endereco, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ success: true, cliente: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await pool.query('DELETE FROM clientes WHERE id = $1 AND usuario_id = $2 RETURNING id', [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ success: true, message: 'Cliente deletado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
