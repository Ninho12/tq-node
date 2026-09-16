# Módulo 06: Criando Servidores Web Nativos com o Módulo `http`

Bem-vindo ao sexto módulo do **tq-node**! Hoje vamos construir um dos pilares mais consagrados do Node.js: **servidores HTTP puros**, sem utilizar nenhum framework externo (como Express ou Fastify).

Antes de frameworks como o Express existirem, o Node.js já revolucionava a web por trazer embutido em sua biblioteca padrão um servidor HTTP completo, ultrarrápido e baseado em eventos. Compreender a API de baixo nível do módulo nativo `http` é indispensável para entender o que frameworks fazem por baixo dos panos.

---

## 1. O Módulo Nativo `node:http`

Para criar um servidor HTTP no Node.js, tudo o que precisamos é importar o módulo nativo `node:http`. Não há necessidade de instalar nada com o NPM.

Veja o exemplo mais minimalista de um servidor HTTP funcional:

```javascript
import http from 'node:http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Olá, Mundo! Servidor Node.js puro em execução.');
});

const PORTA = 3000;
server.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORTA}`);
});
```

Ao executar esse arquivo com `node servidor.js` e abrir o navegador no endereço `http://localhost:3000`, a mensagem de texto será exibida.

---

## 2. A Dupla Fundamental: `req` e `res`

A função de callback passada para `http.createServer((req, res) => {})` é invocada toda vez que um cliente (como um navegador ou app mobile) faz uma requisição ao seu servidor. Ela recebe dois parâmetros fundamentais:

### A. `req` (IncomingMessage)
Representa a **requisição recebida** do cliente. Através dele, acessamos:
* `req.url`: O caminho solicitado (ex: `/produtos?categoria=livros`).
* `req.method`: O verbo HTTP da requisição (`GET`, `POST`, `PUT`, `DELETE`, etc.).
* `req.headers`: Objeto contendo todos os cabeçalhos enviados pelo cliente (ex: `req.headers['user-agent']` ou `req.headers['authorization']`).

### B. `res` (ServerResponse)
Representa a **resposta que você enviará** de volta ao cliente. Através dele, você define:
* `res.statusCode`: O código de status HTTP (ex: `200`, `201`, `404`, `500`).
* `res.setHeader(chave, valor)`: Adiciona ou modifica cabeçalhos HTTP individuais.
* `res.writeHead(statusCode, headers)`: Envia o código de status e os cabeçalhos de uma só vez.
* `res.write(chunk)`: Envia partes do corpo da resposta (útil para streaming).
* `res.end([dados])`: Sinaliza ao cliente que a resposta terminou e finaliza a transmissão.

---

## 3. Roteamento Manual no Servidor Nativo

Em um servidor nativo sem frameworks, o roteamento deve ser implementado manualmente avaliando o método HTTP e o caminho solicitado:

```javascript
import http from 'node:http';

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const metodo = req.method;

  // Rota raiz GET
  if (pathname === '/' && metodo === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ mensagem: 'Bem-vindo à API nativa!' }));
  }

  // Rota de usuários GET
  if (pathname === '/usuarios' && metodo === 'GET') {
    const usuarios = [
      { id: 1, nome: 'Ana' },
      { id: 2, nome: 'Carlos' }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(usuarios));
  }

  // Rota não encontrada (404)
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ erro: 'Rota não encontrada' }));
});

server.listen(3000);
```

---

## 4. Lendo o Corpo da Requisição (*Request Body*) com Streams

Uma das maiores surpresas para quem vem de frameworks de alto nível é descobrir como ler dados enviados em requisições `POST` ou `PUT`.

No Node.js nativo, o objeto `req` é um **Readable Stream** (fluxo de leitura). Os dados enviados pelo cliente não chegam todos de uma vez; eles chegam em pedaços (*chunks* de buffers). Para capturar o corpo completo, precisamos escutar os eventos de stream `'data'` e `'end'`:

```javascript
import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.url === '/cadastrar' && req.method === 'POST') {
    const pedacos = [];

    // O evento 'data' dispara a cada bloco de bytes recebido
    req.on('data', (chunk) => {
      pedacos.push(chunk);
    });

    // O evento 'end' dispara quando todo o corpo foi transmitido
    req.on('end', () => {
      try {
        const corpoCompleto = Buffer.concat(pedacos).toString('utf-8');
        const dados = JSON.parse(corpoCompleto);

        console.log('Dados recebidos:', dados);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensagem: 'Criado com sucesso!', item: dados }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ erro: 'JSON inválido' }));
      }
    });

    return;
  }
});

server.listen(3000);
```

---

## 5. Códigos de Status HTTP Essenciais

Para construir APIs semânticas e profissionais, use os códigos de status adequados:
* **200 OK:** Requisição processada com sucesso (padrão em leituras `GET`).
* **201 Created:** Novo recurso foi criado com sucesso (em `POST`).
* **204 No Content:** Operação realizada com sucesso, sem conteúdo para retornar (comum em `DELETE`).
* **400 Bad Request:** Dados enviados pelo cliente são inválidos ou malformados.
* **401 Unauthorized:** Cliente não autenticado.
* **404 Not Found:** Rota ou recurso solicitado não existe.
* **405 Method Not Allowed:** Rota existe, mas não suporta o verbo HTTP utilizado.
* **500 Internal Server Error:** Falha inesperada do lado do servidor.

---

## 6. Encerramento Gracioso (*Graceful Shutdown*)

Em servidores reais em ambiente de produção, quando uma nova versão da aplicação vai ao ar ou o container é reiniciado, o processo recebe sinais do sistema como `SIGTERM` ou `SIGINT` (Ctrl+C).

Não devemos simplesmente derrubar o processo abruptamente, pois conexões ativas de usuários seriam interrompidas no meio de uma transação. O padrão recomendado é fechar o servidor graciosamente:

```javascript
function encerrarServidor() {
  console.log('\nEncerrando servidor com segurança...');
  server.close(() => {
    console.log('Todas as conexões ativas foram finalizadas. Tchau!');
    process.exit(0);
  });
}

process.on('SIGINT', encerrarServidor);
process.on('SIGTERM', encerrarServidor);
```

---

## 7. Boas Práticas ao Usar `node:http`

1. **Sempre chame `res.end()`:** Esquecer de chamar `res.end()` deixará o navegador do cliente carregando infinitamente até atingir o tempo de timeout.
2. **Defina cabeçalhos adequados:** Sempre envie `Content-Type: application/json; charset=utf-8` para APIs REST.
3. **Limite o tamanho do corpo da requisição:** Se você não limitar a quantidade de bytes recebida nos eventos `'data'`, um usuário mal-intencionado poderá sobrecarregar a memória RAM do seu servidor enviando um payload de gigabytes.
4. **Trate erros no servidor com `server.on('error', ...)`:** Especialmente para capturar erros como porta já ocupada (`EADDRINUSE`).

---
*Parabéns por concluir o Módulo 06! Agora você domina o funcionamento interno das comunicações HTTP nativas no Node.js. Teste seus conhecimentos respondendo ao Quiz do Módulo 06!*
