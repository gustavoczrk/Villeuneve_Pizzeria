const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = 3000;

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img');
  },
  filename: function (req, file, cb) {
    const nomeArquivo = Date.now() + '-' + file.originalname;
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'segredo_super_secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // usar true apenas com HTTPS
}));

//limitacao de quantidade de logins
const limiter = rateLimit({
  windowMs: 1 * 20 * 1000, // 1 minuto
  max: 5, // Máximo 5 tentativas por minuto
  message: "Muitas tentativas. Tente novamente em 1 minuto."
});

app.use("/login", limiter);

//helmet
const helmet = require("helmet");
app.use(helmet());


// Conexão com MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Coxinha123*',
  database: 'villeuneve'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});

function verificaAdmin(req, res, next) {
  if (req.session.usuario && req.session.usuario.tipo === 'admin') {
    return next();
  }
  return res.status(403).send('Acesso negado.');
}

//criando rota protegida
app.get('/admin.html', verificaAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

//ROTA DE LOGOUT
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});


// ================== ROTA DE CADASTRO ==================
app.post('/cadastro', async (req, res) => {
  const { nome, usuario, email, senha } = req.body;

  if (!nome || !usuario || !email || !senha) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  // Validação de senha: pelo menos 6 caracteres, com letra maiúscula, minúscula e número
  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!senhaRegex.test(senha)) {
    return res
      .status(400)
      .send('A senha deve conter ao menos 6 caracteres, com letra maiúscula, minúscula e número.');
  }

  const verificarSQL = 'SELECT * FROM usuarios WHERE usuario = ? OR email = ?';
  db.query(verificarSQL, [usuario, email], async (err, results) => {
    if (err) return res.status(500).send('Erro no servidor.');

    if (results.length > 0) {
      return res.status(409).send('Usuário ou e-mail já cadastrado.');
    }

    try {
      const senhaHash = await bcrypt.hash(senha, 10);
      const sql =
        'INSERT INTO usuarios (nome, usuario, email, senha, tipo) VALUES (?, ?, ?, ?, ?)';
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
});



// ================== ROTA DE LOGIN ==================
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).send('Preencha todos os campos.');
  }

  const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
  db.query(sql, [usuario], async (err, results) => {
    if (err) {
      console.error('Erro na consulta SQL:', err);
      return res.status(500).send('Erro no servidor.');
    }

    if (results.length === 0) {
      return res.status(401).send('Usuário não encontrado.');
    }

    const user = results[0];

    try {
      const senhaCorreta = await bcrypt.compare(senha, user.senha);

      if (!senhaCorreta) {
        return res.status(401).send('Senha incorreta.');
      }

      req.session.usuario = {
        id: user.id,
        nome: user.nome,
        tipo: user.tipo
      };

      if (user.tipo === 'admin') {
        return res.redirect('/admin.html');
      } else {
        return res.redirect('/index.html');
      }
    } catch (erro) {
      console.error('Erro ao comparar senhas:', erro);
      return res.status(500).send('Erro interno.');
    }
  });
});

//rota pra enviar dados da sessao
app.get('/usuario', (req, res) => {
  if (req.session.usuario) {
    res.json(req.session.usuario);
  } else {
    res.json(null);
  }
});

//rota para os produtos(pizzas)
app.post('/produtos', upload.single('imagem'), (req, res) => {
  const { nome, descricao, preco } = req.body;
  const imagem = req.file ? `/img/${req.file.filename}` : '';


  if (!req.session.usuario || req.session.usuario.tipo !== 'admin') {
    return res.status(403).send('Apenas administradores podem cadastrar produtos.');
  }

  if (!nome || !descricao || !preco) {
    return res.status(400).send('Todos os campos obrigatórios devem ser preenchidos.');
  }

  const sql = 'INSERT INTO produtos (nome, descricao, preco, imagem) VALUES (?, ?, ?, ?)';
  db.query(sql, [nome, descricao, preco, imagem], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao cadastrar produto.');
    }
    res.send('Produto cadastrado com sucesso!');
  });
});

//listar produtos
app.get('/produtos', (req, res) => {
  const sql = 'SELECT * FROM produtos ORDER BY data_cadastro DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err);
      return res.status(500).send('Erro ao buscar produtos.');
    }

      res.json(results);
  });
});


//deletar produtos
app.delete('/produtos/:id', (req, res) => {
  if (!req.session.usuario || req.session.usuario.tipo !== 'admin') {
    return res.status(403).send('Acesso negado.');
  }

  const { id } = req.params;
  const sql = 'DELETE FROM produtos WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Erro ao excluir produto:', err);
      return res.status(500).send('Erro ao excluir produto.');
    }

    res.send('Produto excluído com sucesso.');
  });
});

//VERIFICA ADMIN para ver as mensagens na pagina admin.html
app.get('/contatos', verificaAdmin, (req, res) => {
  const sql = 'SELECT * FROM contatos ORDER BY data_envio DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar contatos:', err);
      return res.status(500).send('Erro ao buscar mensagens.');
    }
    res.json(results);
  });
});

//rota pro formulario de contato
app.post('/contato', (req, res) => {
  const { nome, email, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).send("Todos os campos são obrigatórios.");
  }

    const sql = 'INSERT INTO contatos (nome, email, mensagem) VALUES (?, ?, ?)';
  db.query(sql, [nome, email, mensagem], (err, result) => {
    if (err) {
      console.error('Erro ao salvar contato:', err);
      return res.status(500).send('Erro ao enviar mensagem.');
    }

  console.log("Nova mensagem de contato:");
  console.log("Nome:", nome);
  console.log("Email:", email);
  console.log("Mensagem:", mensagem);

  res.send("Mensagem enviada com sucesso!");
  });
});



//INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
