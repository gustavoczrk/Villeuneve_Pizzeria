# 🍕 Villeneuve Pizzeria

Projeto desenvolvido como parte do Projeto Integrador II. Trata-se de um sistema web para a pizzaria **Villeneuve Pizzeria**, voltado para facilitar o acesso dos clientes ao cardápio, realizar pedidos online e futuramente integrar serviços de pagamento.

## 📌 Objetivo

Desenvolver um site funcional para os clientes da pizzaria, com foco em usabilidade, visual agradável e funcionalidades essenciais como:

- Visualização de cardápio
- Realização de pedidos
- Cadastro e login de usuários
- Área de administração (futuramente)
- Integração com sistemas de pagamento (futuramente)

## 🛠️ Tecnologias Utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express

### Banco de Dados
- MySQL (MySQL Workbench)

### Outros
- Trello (organização e backlog)

🚀 Como rodar o projeto localmente
Clone o repositório:

bash
Copiar
Editar
git clone https://github.com/gustavoczrk/Villeuneve_Pizzeria.git
Acesse a pasta do projeto:

bash
Copiar
Editar
cd Villeuneve_Pizzeria
Instale as dependências:

nginx
Copiar
Editar
npm install
Inicie o servidor:

bash
Copiar
Editar
node js/server.js
Acesse no navegador:

arduino
Copiar
Editar
http://localhost:3000
⚠️ Importante:
Certifique-se de que o MySQL Server está rodando e que o banco de dados villeuneve já foi criado com a seguinte estrutura:

sql
Copiar
Editar
CREATE DATABASE villeuneve;

USE villeuneve;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  usuario VARCHAR(50) UNIQUE,
  email VARCHAR(100),
  senha VARCHAR(255),
  tipo ENUM('admin', 'user') DEFAULT 'user'
);
