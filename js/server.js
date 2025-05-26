const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'SUA_SENHA_AQUI',
  database: 'villeuneve'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});

// ================== ROTA DE CADASTRO ==================
app.post('/cadastro', async (req, res) => {
  const { nome, usuario, email, senha } = req.body;

  if (!nome || !usuario || !email || !senha) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const sql = 'INSERT INTO usuarios (nome, usuario, email, senha, tipo) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nome, usuario, email, senhaHash, 'user'], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro ao cadastrar usuário.');
      }
      res.send('Usuário cadastrado com sucesso!');
    });
  } catch (erro) {
    res.status(500).send('Erro ao processar a senha.');
  }
});

// ================== ROTA DE LOGIN ==================
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
  db.query(sql, [usuario], async (err, results) => {
    if (err) return res.status(500).send('Erro no servidor.');

    if (results.length === 0) {
      return res.status(401).send('Usuário não encontrado.');
    }

    const user = results[0];
    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) {
      return res.status(401).send('Senha incorreta.');
    }

    // Verificação de tipo
    if (user.tipo === 'admin') {
      res.send('Bem-vindo, administrador!');
    } else {
      res.send('Login realizado com sucesso.');
    }
  });
});

// ================== INICIAR SERVIDOR ==================
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
