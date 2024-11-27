# Catálogo Musical

Este é um projeto de catálogo musical, que permite cadastrar e visualizar informações sobre discos, artistas e gêneros musicais. O sistema permite pesquisar e filtrar discos com base em título, artista e gênero, além de exibir detalhes como capa do disco e ano de lançamento.

## Tecnologias Utilizadas

- **Backend:** Node.js com Express
- **Banco de Dados:** PostgreSQL
- **Frontend:** HTML, CSS, Bootstrap
- **Template Engine:** EJS (Embedded JavaScript)
- **Outras Dependências:** `pg` (para conectar ao PostgreSQL), `dotenv` (para variáveis de ambiente), `express` (framework para Node.js)

## Funcionalidades

- Exibição de discos cadastrados com título, artista, gênero e ano de lançamento.
- Pesquisa por título, artista ou gênero.
- Sistema de relacionamento entre discos, artistas e gêneros no banco de dados.
- Interface responsiva utilizando Bootstrap.

## Estrutura do Banco de Dados

O banco de dados contém as seguintes tabelas:

### 1. **generos**
### 2. **faixas**
### 3. **artistas**
### 4. **discos**
### 5. **diaco_generos**


# Como Rodar o Projeto

## Pré-requisitos

- Node.js (v14 ou superior)
- PostgreSQL configurado e rodando

## Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/el1ziane/catalogoMusical.git
   cd catalogo-musical

## Instale as dependências:

```bash
npm install

## Configure as variáveis de ambiente:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco

## Execute o projeto:

```bash
npm start

Acesse o sistema no seu navegador em [http://localhost:3000](http://localhost:3000).


