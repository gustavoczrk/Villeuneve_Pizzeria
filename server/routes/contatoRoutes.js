const express = require('express');
const db = require('../db/conexao');
const verificaAdmin = require('../middlewares/verificaAdmin');

const router = express.Router();

// Enviar mensagem de contato
router.post('/contato', (req, res) => {
  const { nome, email, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).send("Todos os campos são obrigatórios.");
  }

  const sql = 'INSERT INTO contatos (nome, email, mensagem) VALUES (?, ?, ?)';
  db.query(sql, [nome, email, mensagem], (err) => {
    if (err) return res.status(500).send('Erro ao enviar mensagem.');
    res.send("Mensagem enviada com sucesso!");
  });
});

// Visualizar mensagens (admin)
router.get('/contatos', verificaAdmin, (req, res) => {
  const sql = 'SELECT * FROM contatos ORDER BY data_envio DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar mensagens.');
    res.json(results);
  });
});

module.exports = router;
