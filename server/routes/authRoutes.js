const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/conexao');
const verificaAdmin = require('../middlewares/verificaAdmin');

const router = express.Router();

// ROTA DE CADASTRO
router.post('/cadastro', async (req, res) => {
  const { nome, usuario, email, senha } = req.body;

  if (!nome || !usuario || !email || !senha) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!senhaRegex.test(senha)) {
    return res.status(400).send('A senha deve conter ao menos 6 caracteres, com letra maiúscula, minúscula e número.');
  }

  const verificarSQL = 'SELECT * FROM usuarios WHERE usuario = ? OR email = ?';
  db.query(verificarSQL, [usuario, email], async (err, results) => {
    if (err) return res.status(500).send('Erro no servidor.');

    if (results.length > 0) {
      return res.status(409).send('Usuário ou e-mail já cadastrado.');
    }

    try {
      const senhaHash = await bcrypt.hash(senha, 10);
      const sql = 'INSERT INTO usuarios (nome, usuario, email, senha, tipo) VALUES (?, ?, ?, ?, ?)';
      db.query(sql, [nome, usuario, email, senhaHash, 'user'], (err) => {
        if (err) return res.status(500).send('Erro ao cadastrar usuário.');
        res.send('Usuário cadastrado com sucesso!');
      });
    } catch (erro) {
      res.status(500).send('Erro ao processar a senha.');
    }
  });
});

// ROTA DE LOGIN
router.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) return res.status(400).json({ erro: 'Preencha todos os campos.' });

  const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
  db.query(sql, [usuario], async (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
    if (results.length === 0) return res.status(401).json({ erro: 'Usuário não encontrado.' });

    const user = results[0];
    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) return res.status(401).json({ erro: 'Senha incorreta.' });

    req.session.usuario = { id: user.id, nome: user.nome, tipo: user.tipo };

    return res.status(200).json({
      usuario: {
        id: user.id,
        nome: user.nome,
        tipo: user.tipo
      }
    });
  });
});

// ROTA DE LOGOUT
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// ROTA DE SESSÃO COM ENDEREÇO
router.get('/usuario', (req, res) => {
  if (!req.session.usuario) return res.status(401).send("Não autenticado.");

  const sql = 'SELECT id, nome, tipo, endereco FROM usuarios WHERE id = ?';
  db.query(sql, [req.session.usuario.id], (err, results) => {
    if (err) return res.status(500).send("Erro no servidor.");
    if (results.length === 0) return res.status(404).send("Usuário não encontrado.");

    res.json(results[0]);
  });
});

// ROTA PARA ATUALIZAR ENDEREÇO
router.post('/usuario/endereco', (req, res) => {
  if (!req.session.usuario) return res.status(401).send("Não autenticado.");
  const { endereco } = req.body;

  if (!endereco) return res.status(400).send("Endereço não fornecido.");

  const sql = 'UPDATE usuarios SET endereco = ? WHERE id = ?';
  db.query(sql, [endereco, req.session.usuario.id], (err) => {
    if (err) return res.status(500).send("Erro ao atualizar endereço.");
    res.send("Endereço atualizado com sucesso.");
  });
});

// ROTA PROTEGIDA PARA ADMIN
router.get('/admin.html', verificaAdmin, (req, res) => {
  res.sendFile(require('path').join(__dirname, '..', 'public', 'admin.html'));
});

module.exports = router;
