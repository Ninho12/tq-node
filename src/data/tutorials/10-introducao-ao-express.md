# Módulo 10: Introdução ao Express.js: Criando APIs Robustas

Parabéns por chegar ao décimo e último módulo da trilha fundamental do **tq-node**! No Módulo 06, aprendemos a construir servidores web utilizando apenas o módulo nativo `http`. Você viu que, embora o Node.js puro seja incrivelmente performático, construir uma aplicação real exige lidar com muito código boilerplate: verificar métodos com dezenas de `if/else`, capturar pedaços de streams para ler o corpo da requisição e tratar manualmente todos os cabeçalhos.

É para solucionar essas dores que surgem os frameworks web. E nenhum framework na história do Node.js é mais influente, estável e amplamente utilizado do que o **Express.js**.

---

## 1. O que é o Express.js?

O Express é um framework web **minimalista**, **rápido** e **não-opinativo** para Node.js. Ele não tenta reinventar a roda: ele simplesmente adiciona uma camada elegante de abstração sobre o módulo nativo `http` do Node.js, fornecendo:
* Sistema intuitivo de roteamento por verbos HTTP (`GET`, `POST`, `PUT`, `DELETE`).
* Arquitetura poderosa e extensível baseada em **Middlewares**.
* Métodos utilitários convenientes como `res.json()` e `res.status()`.
* Parsing simplificado de parâmetros de URL e payloads JSON.

### Instalando o Express no Projeto:
```bash
npm install express
```

---

## 2. Seu Primeiro Servidor com Express

Veja como criar um servidor completo em pouquíssimas linhas de código com sintaxe moderna ESM:

```javascript
import express from 'express';

const app = express();
const PORTA = 3000;

// Rota raiz GET
app.get('/', (req, res) => {
  res.json({ mensagem: 'Bem-vindo à minha primeira API com Express!' });
});

// Iniciando o servidor
app.listen(PORTA, () => {
  console.log(`🚀 Servidor Express rodando em http://localhost:${PORTA}`);
});
```

Ao comparar esse exemplo com o servidor nativo que construímos no Módulo 06, a simplicidade e a legibilidade do Express saltam aos olhos!

---

## 3. O Coração do Express: A Arquitetura de Middlewares

Se você entender **Middlewares**, você dominará 90% de todo o ecossistema do Express.

Um middleware nada mais é do que uma **função intermediária** que intercepta a requisição antes que ela chegue ao manipulador final da rota (ou entre diferentes etapas). Ela recebe três parâmetros:
$$\text{function}(req, res, next)$$

* **`req`**: Objeto da requisição.
* **`res`**: Objeto da resposta.
* **`next`**: Uma função que, quando invocada, passa o controle da execução para o **próximo middleware** da fila.

### A. Middleware Embutido: `express.json()`
Lembra de quando tínhamos que escutar os eventos `'data'` e `'end'` para agrupar buffers e fazer `JSON.parse()`? No Express, uma única linha resolve isso para toda a aplicação:

```javascript
// Habilita o parsing automático de corpos de requisição em JSON
app.use(express.json());
```
Com isso, qualquer requisição `POST` com cabeçalho `Content-Type: application/json` terá seus dados automaticamente convertidos e prontos para uso em **`req.body`**!

### B. Criando um Middleware Personalizado (Logger)
```javascript
// Middleware que registra o método, rota e horário de cada requisição
app.use((req, res, next) => {
  const dataHora = new Date().toISOString();
  console.log(`[${dataHora}] ${req.method} em ${req.url}`);
  
  // NUNCA se esqueça de chamar next()!
  next();
});
```
*⚠️ **Atenção:** Se um middleware não enviar uma resposta (`res.json()`, `res.send()`) e também não invocar `next()`, a requisição do usuário ficará congelada para sempre.*

---

## 4. Capturando Parâmetros: Params, Query e Body

O Express facilita imensamente o acesso a qualquer dado enviado pelo cliente:

### A. Parâmetros de Rota (`req.params`)
Utilizados para identificar recursos específicos pelo identificador na URL:
```javascript
// Exemplo: GET /usuarios/42
app.get('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  res.json({ idUsuario: id, nome: 'João Paulo' });
});
```

### B. Parâmetros de Consulta / Query String (`req.query`)
Utilizados para filtros, ordenações e paginação após o ponto de interrogação `?`:
```javascript
// Exemplo: GET /produtos?categoria=livros&ordem=asc
app.get('/produtos', (req, res) => {
  const { categoria, ordem } = req.query;
  res.json({ filtroCategoria: categoria, ordenacao: ordem });
});
```

### C. Corpo da Requisição (`req.body`)
Utilizado em requisições de criação ou atualização (`POST`, `PUT`, `PATCH`):
```javascript
// Exemplo: POST /usuarios com corpo {"nome": "Maria", "email": "maria@email.com"}
app.post('/usuarios', (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ erro: 'Nome e email são obrigatórios!' });
  }

  // Responde com status semântico 201 Created
  res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', usuario: { nome, email } });
});
```

---

## 5. Tratamento de Erros e Rota 404

### A. Rota Não Encontrada (404)
Posicionada após todas as rotas declaradas, para capturar qualquer requisição que não encontrou correspondência:
```javascript
app.use((req, res) => {
  res.status(404).json({ erro: 'Recurso não encontrado' });
});
```

### B. Middleware Centralizado de Erros (4 Parâmetros)
O Express identifica middlewares de erro pela presença de **quatro argumentos**: `(err, req, res, next)`. Deve ser sempre o último middleware registrado no `app`:

```javascript
app.use((err, req, res, next) => {
  console.error('Falha interna capturada:', err.stack);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});
```

---

## 6. Boas Práticas ao Desenvolver com Express

1. **Separe rotas com `express.Router()`:** Em aplicações reais, não amontoe todas as rotas no mesmo arquivo. Crie arquivos dedicados (ex: `src/routes/usuarios.js`) e importe-os no `app`.
2. **Sempre retorne respostas com status semânticos:** Encadeie `res.status(código).json(...)` em vez de responder tudo com 200 genérico.
3. **Use middlewares de segurança:** Pacotes consagrados da comunidade como `cors` (para controle de domínios) e `helmet` (para proteção de cabeçalhos HTTP) são essenciais em produção.

---
*Parabéns por concluir o Módulo 10 e toda a trilha curricular do tq-node! Você agora tem a base completa de Node.js: desde caminhos, arquivos e o Event Loop, até servidores HTTP puros, ferramentas CLI interativas e o ecossistema Express.js! Agora, finalize com chave de ouro respondendo ao Quiz do Módulo 10!*
