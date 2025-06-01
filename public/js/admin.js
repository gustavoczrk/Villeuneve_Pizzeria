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
        carregarProdutos(); // atualiza listagem
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


    // Ativa os botões de exclusão
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
              carregarProdutos(); // atualiza lista
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

carregarContatos();

// Carrega lista ao abrir a página
carregarProdutos();
