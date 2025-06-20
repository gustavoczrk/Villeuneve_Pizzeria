async function carregarCardapio() {
  const container = document.getElementById("lista-cardapio");
  container.innerHTML = "<p>Carregando...</p>";

  try {
    const res = await fetch("/produtos");
    const produtos = await res.json();

    if (!Array.isArray(produtos) || produtos.length === 0) {
      container.innerHTML = "<p>Nenhuma pizza disponível no momento.</p>";
      return;
    }

    container.innerHTML = produtos.map(pizza => `
      <div class="menu-item">
        <img src="${pizza.imagem}" alt="${pizza.nome}" />
        <h3>${pizza.nome}</h3>
        <p>${pizza.descricao}</p>
        <p><strong>R$ ${Number(pizza.preco).toFixed(2)}</strong></p>
        <button class="btn-adicionar" onclick='adicionarAoCarrinho(${JSON.stringify(pizza)})'>
  Adicionar ao Carrinho
</button>

      </div>  
    `).join("");

  } catch (erro) {
    console.error("Erro ao carregar cardápio:", erro);
    container.innerHTML = "<p>Erro ao carregar cardápio.</p>";
  }
}

function adicionarAoCarrinho(pizza) {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  const id = usuario?.id || "anonimo";
  const chave = `carrinho_${id}`;

  let carrinho = JSON.parse(localStorage.getItem(chave)) || [];

  const index = carrinho.findIndex(item => item.id === pizza.id);
  if (index !== -1) {
    carrinho[index].quantidade += 1;
  } else {
    carrinho.push({ ...pizza, quantidade: 1 });
  }

  localStorage.setItem(chave, JSON.stringify(carrinho));
  alert("Pizza adicionada ao carrinho!");
}


function atualizarContadorCarrinho() {
  const contador = document.getElementById("contador-carrinho");
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  if (contador) {
    contador.innerText = totalItens;
  }
}

atualizarContadorCarrinho();

carregarCardapio();
