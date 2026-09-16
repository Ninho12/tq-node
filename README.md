# TQ-Node (`tq-node`)

Ferramenta CLI interativa desenvolvida para ensinar **Node.js** e **NPM** diretamente pelo terminal, combinando **T**utoriais detalhados em Markdown e **Q**uizzes interativos em JSON com validação instantânea.

## 🚀 Como Instalar e Rodar Localmente

1. Certifique-se de ter o **Node.js** (v18+) e o **NPM** instalados em sua máquina.
2. No terminal, navegue até a pasta do projeto (`tq-node`).
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Para vincular o comando globalmente no seu sistema operacional:
   ```bash
   npm link
   ```
5. Agora você pode usar a CLI em qualquer lugar do seu terminal:
   * **Listar todos os tutoriais disponíveis:**
     ```bash
     tq-node list
     # ou o atalho:
     tq-node ls
     ```
   * **Menu interativo de tutoriais:**
     ```bash
     tq-node tutorial
     ```
   * **Abrir tutorial diretamente por número ou nome:**
     ```bash
     tq-node tutorial 3
     tq-node tutorial manipulacao-de-arquivos
     ```
   * **Menu interativo de quizzes:**
     ```bash
     tq-node quiz
     ```
   * **Iniciar quiz diretamente por número ou nome:**
     ```bash
     tq-node quiz 3
     ```

---

## 📚 Trilha Completa de Conteúdo (10 Módulos)

1. **01. Instalação (`1-instalacao`)**: Primeiros passos, instalação do Node.js e NPM e verificação de versões.
2. **02. Caminhos e Path (`2-caminhos-path`)**: Normalização e resolução multiplataforma com o módulo nativo `path`.
3. **03. Manipulação de Arquivos (`3-manipulacao-de-arquivos`)**: O módulo `fs` (Sync, Callbacks e `fs/promises`), tratamento de erros e boas práticas.
4. **04. Sistema de Módulos (`4-sistema-de-modulos`)**: CommonJS vs ES Modules, `"type": "module"`, `import.meta.url` e top-level await.
5. **05. Event Loop (`5-event-loop`)**: Concorrência single-threaded, libuv, fases do Event Loop, microtasks e starvation.
6. **06. Servidor HTTP (`6-servidor-http`)**: Servidores web nativos sem frameworks, `req` como stream, `res`, status codes e graceful shutdown.
7. **07. NPM e package.json (`7-npm-e-package-json`)**: SemVer, dependencies vs devDependencies, package-lock.json e scripts de automação.
8. **08. Streams e Buffers (`8-streams-e-buffers`)**: Manipulação de dados de alto volume, memória eficiente, pipeline e backpressure.
9. **09. Criação de CLI (`9-criacao-de-cli`)**: Linha Shebang, Commander.js, `@inquirer/prompts`, Chalk e Exit Codes.
10. **10. Introdução ao Express (`10-introducao-ao-express`)**: Primeiros passos com Express.js, middlewares, roteamento e tratamento de erros.

---

## 📁 Estrutura de Arquivos

* `bin/index.js`: Ponto de entrada dinâmico da CLI configurado com Commander e Inquirer (suporta `list`, `tutorial` e `quiz`).
* `src/data/tutorials/`: Tutoriais completos em formato Markdown (`.md`).
* `src/data/quizzes/`: Quizzes estruturados em JSON (`.json`) com 10 perguntas e gabarito explicativo por módulo.
