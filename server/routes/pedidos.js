const express = require('express');
const db = require('../db/conexao');
const verificaAdmin = require('../middlewares/verificaAdmin');

const router = express.Router();

// POST /pedido - salvar pedido
router.post('/pedido', (req, res) => {
  const { nome, endereco, telefone, pagamento, itens } = req.body;
  const usuario_id = req.session.usuario?.id;

  if (!nome || !endereco || !telefone || !pagamento || !itens?.length) {
    return res.status(400).send("Dados incompletos.");
  }

  const sqlPedido = 'INSERT INTO pedidos (usuario_id, nome, endereco, telefone, pagamento) VALUES (?, ?, ?, ?, ?)';
  db.query(sqlPedido, [usuario_id, nome, endereco, telefone, pagamento], (err, result) => {
    if (err) return res.status(500).send('Erro ao salvar pedido.');

    const pedidoId = result.insertId;
    const valores = itens.map(item => [pedidoId, item.id, item.quantidade]);

    const sqlItens = 'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade) VALUES ?';
    db.query(sqlItens, [valores], (err2) => {
      if (err2) return res.status(500).send('Erro ao salvar itens.');
      res.send("Pedido salvo com sucesso!");
    });
  });
});

// GET /admin/pedidos - listar pedidos (admin)
router.get('/admin/pedidos', verificaAdmin, (req, res) => {
  const sql = `
    SELECT p.id, p.nome, p.endereco, p.telefone, p.pagamento, p.data_pedido, p.status,
           i.produto_id, i.quantidade, pr.nome AS produto_nome, pr.preco
    FROM pedidos p
    JOIN itens_pedido i ON i.pedido_id = p.id
    JOIN produtos pr ON pr.id = i.produto_id
    ORDER BY p.data_pedido DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar pedidos.');
    res.json(results);
  });
});

router.put('/admin/pedidos/:id/status', verificaAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const statusValidos = ['Recebido', 'Em Preparo', 'Saiu para Entrega', 'Finalizado'];
  if (!statusValidos.includes(status)) {
    return res.status(400).send('Status inválido.');
  }

  const sql = 'UPDATE pedidos SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).send('Erro ao atualizar status.');
    res.send('Status atualizado com sucesso.');
  });
});

// DELETE /admin/pedidos/:id - excluir pedido e seus itens
router.delete('/admin/pedidos/:id', verificaAdmin, (req, res) => {
  const { id } = req.params;

  // Exclui os itens primeiro
  const sqlItens = 'DELETE FROM itens_pedido WHERE pedido_id = ?';
  db.query(sqlItens, [id], (err) => {
    if (err) return res.status(500).send('Erro ao excluir itens do pedido.');

    // Depois exclui o pedido
    const sqlPedido = 'DELETE FROM pedidos WHERE id = ?';
    db.query(sqlPedido, [id], (err2) => {
      if (err2) return res.status(500).send('Erro ao excluir pedido.');
      res.send('Pedido excluído com sucesso.');
    });
  });
});


module.exports = router;
