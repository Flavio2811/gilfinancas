const express = require('express');
const router = express.Router();
const pool = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

router.post('/register', async (req, res) => {
  try {
    const { email, password, nome_dono, telefone } = req.body;

    if (!email || !password || !nome_dono) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    const userExists = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO usuarios (email, senha_hash, nome_dono, telefone) VALUES ($1, $2, $3, $4) RETURNING id, email',
      [email, hashedPassword, nome_dono, telefone]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await pool.query('SELECT id, email, senha_hash FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.senha_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || '24h'
    });

    res.json({ success: true, token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
