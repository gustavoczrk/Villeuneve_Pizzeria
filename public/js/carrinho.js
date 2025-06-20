function carregarCarrinho() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  const id = usuario?.id || "anonimo";
  const chave = `carrinho_${id}`;

  const container = document.getElementById("lista-carrinho");
  let carrinho = JSON.parse(localStorage.getItem(chave)) || [];

  if (carrinho.length === 0) {
    container.innerHTML = "<p>Seu carrinho está vazio.</p>";
    document.getElementById("total").innerText = "Total: R$ 0,00";
    return;
  }

  let total = 0;
  container.innerHTML = carrinho.map((item, i) => {
    const subtotal = item.quantidade * Number(item.preco);
    total += subtotal;

    return `
      <div class="produto-item">
        <h4>${item.nome}</h4>
        <p>${item.descricao}</p>
        <p>Preço unitário: R$ ${Number(item.preco).toFixed(2)}</p>
        <p>Quantidade: ${item.quantidade}</p>
        <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
        <button onclick="removerDoCarrinho(${i})">Remover</button>
      </div>
    `;
  }).join("");

  document.getElementById("total").innerText = `Total: R$ ${total.toFixed(2)}`;
}

function removerDoCarrinho(index) {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  const id = usuario?.id || "anonimo";
  const chave = `carrinho_${id}`;

  let carrinho = JSON.parse(localStorage.getItem(chave)) || [];
  carrinho.splice(index, 1);
  localStorage.setItem(chave, JSON.stringify(carrinho));
  carregarCarrinho();
}

function atualizarContadorCarrinho() {
  const contador = document.getElementById("contador-carrinho");
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  const id = usuario?.id || "anonimo";
  const chave = `carrinho_${id}`;
  const carrinho = JSON.parse(localStorage.getItem(chave)) || [];

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  if (contador) {
    contador.innerText = totalItens;
  }
}

document.getElementById("btn-finalizar")?.addEventListener("click", () => {
  document.getElementById("formulario-pedido").style.display = "block";
});

document.getElementById("form-pedido")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = e.target.nome.value.trim();
  const endereco = e.target.endereco.value.trim();
  const telefone = e.target.telefone.value.trim();
  const pagamento = e.target.pagamento.value;

  if (!nome || !endereco || !telefone || !pagamento) {
    document.getElementById("mensagem-pedido").innerText = "Preencha todos os campos.";
    return;
  }

  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  const id = usuario?.id || "anonimo";
  const chave = `carrinho_${id}`;
  const carrinho = JSON.parse(localStorage.getItem(chave)) || [];

  if (carrinho.length === 0) {
    document.getElementById("mensagem-pedido").innerText = "Seu carrinho está vazio.";
    return;
  }

  const pedido = {
    cliente: { nome, endereco, telefone, pagamento },
    itens: carrinho.map(item => ({
      id: item.id,
      nome: item.nome,
      preco: item.preco,
      quantidade: item.quantidade
    })),
    data: new Date().toLocaleString()
  };

  try {
    const response = await fetch('/pedido', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome,
        endereco,
        telefone,
        pagamento,
        itens: pedido.itens.map(({ id, quantidade }) => ({ id, quantidade }))
      })
    });

    if (!response.ok) throw new Error("Erro ao enviar pedido");

    // salvar pedido completo para mostrar no resumo
    localStorage.setItem('ultimoPedido', JSON.stringify(pedido));

    localStorage.removeItem(chave);
    carregarCarrinho();
    atualizarContadorCarrinho();

    window.location.href = "/pedido-confirmado.html";

  } catch (err) {
    console.error(err);
    document.getElementById("mensagem-pedido").innerText = "Erro ao confirmar pedido.";
  }
});

atualizarContadorCarrinho();
carregarCarrinho();

async function preencherEnderecoSalvo() {
  try {
    const res = await fetch("/usuario");
    if (!res.ok) return;

    const usuario = await res.json();
    const campoEndereco = document.querySelector("#form-pedido input[name='endereco']");
    if (campoEndereco && usuario.endereco) {
      campoEndereco.value = usuario.endereco;
    }
  } catch (err) {
    console.error("Erro ao carregar endereço do usuário:", err);
  }
}

preencherEnderecoSalvo();