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
      </div>
    `).join("");

  } catch (erro) {
    console.error("Erro ao carregar cardápio:", erro);
    container.innerHTML = "<p>Erro ao carregar cardápio.</p>";
  }
}

carregarCardapio();
