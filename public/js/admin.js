const formProduto = document.getElementById("form-produto");

if (formProduto) {
  formProduto.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (
      !formProduto.nome.value.trim() ||
      !formProduto.descricao.value.trim() ||
      !formProduto.preco.value.trim()
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const formData = new FormData(formProduto);

    try {
      const resposta = await fetch("/produtos", {
        method: "POST",
        body: formData
      });

      const texto = await resposta.text();

      if (resposta.ok) {
        alert("Produto cadastrado com sucesso!");
        formProduto.reset();
        carregarProdutos();
      } else {
        alert("Erro: " + texto);
      }
    } catch (erro) {
      console.error("Erro ao cadastrar produto:", erro);
      alert("Erro inesperado. Tente novamente.");
    }
  });
}

async function carregarProdutos() {
  const lista = document.getElementById("lista-produtos");
  lista.innerHTML = "<p>Carregando...</p>";

  try {
    const res = await fetch("/produtos");
    const produtos = await res.json();

    if (!Array.isArray(produtos)) {
      lista.innerHTML = "<p>Erro ao carregar os produtos.</p>";
      return;
    }

    if (produtos.length === 0) {
      lista.innerHTML = "<p>Nenhuma pizza cadastrada ainda.</p>";
      return;
    }

    lista.innerHTML = produtos.map(pizza => `
      <div class="produto-item">
        <h3>${pizza.nome}</h3>
        <p>${pizza.descricao}</p>
        <p><strong>Preço:</strong> R$ ${Number(pizza.preco).toFixed(2)}</p>
        ${pizza.imagem ? `<img src="${pizza.imagem}" alt="${pizza.nome}" width="150">` : ''}
        <div style="margin-top: 10px;">
          <button class="btn-excluir" data-id="${pizza.id}">Excluir</button>
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".btn-excluir").forEach(botao => {
      botao.addEventListener("click", async () => {
        const id = botao.dataset.id;
        if (confirm("Tem certeza que deseja excluir esta pizza?")) {
          try {
            const res = await fetch(`/produtos/${id}`, {
              method: "DELETE"
            });

            const texto = await res.text();

            if (res.ok) {
              alert(texto);
              carregarProdutos();
            } else {
              alert("Erro: " + texto);
            }
          } catch (erro) {
            console.error("Erro ao excluir produto:", erro);
            alert("Erro ao excluir produto.");
          }
        }
      });
    });

  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
    lista.innerHTML = "<p>Erro inesperado.</p>";
  }
}

async function carregarContatos() {
  const container = document.getElementById("lista-contatos");
  if (!container) return;

  container.innerHTML = "<p>Carregando mensagens...</p>";

  try {
    const res = await fetch("/contatos");
    const mensagens = await res.json();

    if (!Array.isArray(mensagens) || mensagens.length === 0) {
      container.innerHTML = "<p>Nenhuma mensagem recebida ainda.</p>";
      return;
    }

    container.innerHTML = mensagens.map(msg => `
      <div class="contato-item">
        <p><strong>Nome:</strong> ${msg.nome}</p>
        <p><strong>Email:</strong> ${msg.email}</p>
        <p><strong>Mensagem:</strong> ${msg.mensagem}</p>
        <p><em>Enviado em: ${new Date(msg.data_envio).toLocaleString()}</em></p>
        <hr />
      </div>
    `).join("");
  } catch (erro) {
    console.error("Erro ao carregar mensagens:", erro);
    container.innerHTML = "<p>Erro ao carregar mensagens.</p>";
  }
}

async function carregarPedidos() {
  const container = document.getElementById("lista-pedidos");
  if (!container) return;

  container.innerHTML = "<p>Carregando pedidos...</p>";

  try {
    const res = await fetch("/admin/pedidos");
    const pedidos = await res.json();

    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      container.innerHTML = "<p>Nenhum pedido encontrado.</p>";
      return;
    }

    // Agrupar pedidos por ID
    const agrupados = {};
    pedidos.forEach(p => {
      if (!agrupados[p.id]) {
        agrupados[p.id] = {
          id: p.id,
          nome: p.nome,
          endereco: p.endereco,
          telefone: p.telefone,
          pagamento: p.pagamento,
          data: p.data_pedido,
          status: p.status || 'pendente',
          itens: []
        };
      }

      agrupados[p.id].itens.push({
        nome: p.produto_nome,
        quantidade: p.quantidade,
        preco: p.preco
      });
    });

    // Renderizar pedidos agrupados
    container.innerHTML = Object.values(agrupados).map(pedido => {
      const itensHtml = pedido.itens.map(item => `
        <li>${item.nome} - ${item.quantidade}x - R$ ${(item.preco * item.quantidade).toFixed(2)}</li>
      `).join("");

      return `
  <div class="contato-item">
    <p><strong>Pedido #${pedido.id}</strong></p>
    <p><strong>Cliente:</strong> ${pedido.nome}</p>
    <p><strong>Endereço:</strong> ${pedido.endereco}</p>
    <p><strong>Telefone:</strong> ${pedido.telefone}</p>
    <p><strong>Pagamento:</strong> ${pedido.pagamento}</p>
    <p><strong>Data:</strong> ${new Date(pedido.data).toLocaleString()}</p>
    <label><strong>Status:</strong>
      <select class="status-select" data-id="${pedido.id}">
        ${['Recebido', 'Em Preparo', 'Saiu para Entrega', 'Finalizado'].map(s => `
          <option value="${s}" ${s === pedido.status ? 'selected' : ''}>${s}</option>
        `).join("")}
      </select>
    </label>
    <p><strong>Itens:</strong></p>
    <ul>${itensHtml}</ul>
    ${pedido.status === 'Finalizado' ? `
      <button class="btn-excluir-pedido" data-id="${pedido.id}">Excluir Pedido</button>
    ` : ''}
  </div>
`;

    }).join("");

    document.querySelectorAll(".status-select").forEach(select => {
  select.addEventListener("change", async () => {
    const pedidoId = select.dataset.id;
    const novoStatus = select.value;

    try {
      const res = await fetch(`/admin/pedidos/${pedidoId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus })
      });

      const msg = await res.text();
      alert(msg);
      carregarPedidos();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status.");
    }
  });
});

document.querySelectorAll(".btn-excluir-pedido").forEach(botao => {
  botao.addEventListener("click", async () => {
    const id = botao.dataset.id;
    if (confirm("Deseja excluir este pedido finalizado?")) {
      try {
        const res = await fetch(`/admin/pedidos/${id}`, {
          method: "DELETE"
        });
        const msg = await res.text();
        alert(msg);
        carregarPedidos();
      } catch (erro) {
        console.error("Erro ao excluir pedido:", erro);
        alert("Erro ao excluir pedido.");
      }
    }
  });
});


  } catch (erro) {
    console.error("Erro ao carregar pedidos:", erro);
    container.innerHTML = "<p>Erro ao carregar pedidos.</p>";
  }
}

// parte colapsavel 
document.querySelectorAll(".toggle-btn").forEach(botao => {
  botao.addEventListener("click", () => {
    const conteudo = botao.nextElementSibling;
    conteudo.classList.toggle("ativo");
  });
});


// Executar carregamentos ao abrir a página
carregarProdutos();
carregarContatos();
carregarPedidos();
