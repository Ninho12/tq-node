# TQ-Node (`tq-node`)

Ferramenta CLI interativa desenvolvida para ensinar o básico sobre **Node.js** e **NPM** diretamente pelo terminal, combinando **T**utoriais (Markdown) e **Q**uizzes (JSON).

## 🚀 Como Instalar e Rodar Localmente

1. Certifique-se de ter o **Node.js** e o **NPM** instalados em sua máquina.
2. Extraia a pasta do projeto.
3. No terminal, navegue até a pasta raiz do projeto (`tq-node`).
4. Instale as dependências:
   ```bash
   npm install
   ```
5. Para testar a CLI localmente vinculando o comando globalmente, execute:
   ```bash
   npm link
   ```
6. Agora você pode usar os comandos de qualquer lugar no seu terminal:
   * **Ver o tutorial:**
     ```bash
     tq-node tutorial
     ```
   * **Responder ao quiz:**
     ```bash
     tq-node quiz
     ```

## 📁 Estrutura do Projeto
* `bin/index.js`: Ponto de entrada da CLI configurado com Commander.js e Inquirer.
* `src/data/tutorials/instalacao.md`: Conteúdo educacional em Markdown.
* `src/data/quizzes/instalacao.json`: Perguntas e alternativas estruturadas em JSON.
