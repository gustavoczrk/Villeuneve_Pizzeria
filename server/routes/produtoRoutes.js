const express = require('express');
const multer = require('multer');
const db = require('../db/conexao');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/img'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// Cadastrar produto
router.post('/produtos', upload.single('imagem'), (req, res) => {
  const { nome, descricao, preco } = req.body;
  const imagem = req.file ? `/img/${req.file.filename}` : '';

  if (!req.session.usuario || req.session.usuario.tipo !== 'admin') {
    return res.status(403).send('Apenas administradores podem cadastrar produtos.');
  }

  if (!nome || !descricao || !preco) {
    return res.status(400).send('Todos os campos obrigatórios devem ser preenchidos.');
  }

  const sql = 'INSERT INTO produtos (nome, descricao, preco, imagem) VALUES (?, ?, ?, ?)';
  db.query(sql, [nome, descricao, preco, imagem], (err) => {
    if (err) return res.status(500).send('Erro ao cadastrar produto.');
    res.send('Produto cadastrado com sucesso!');
  });
});

// Listar produtos
router.get('/produtos', (req, res) => {
  const sql = 'SELECT * FROM produtos ORDER BY data_cadastro DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar produtos.');
    res.json(results);
  });
});

// Excluir produto
router.delete('/produtos/:id', (req, res) => {
  if (!req.session.usuario || req.session.usuario.tipo !== 'admin') {
    return res.status(403).send('Acesso negado.');
  }

  const sql = 'DELETE FROM produtos WHERE id = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).send('Erro ao excluir produto.');
    res.send('Produto excluído com sucesso.');
  });
});

module.exports = router;
