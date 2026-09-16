# Módulo 07: NPM e `package.json`: Gerenciamento de Dependências e Scripts

Bem-vindo ao sétimo módulo do **tq-node**! Se o Node.js é o motor de execução do seu código JavaScript no servidor, o **NPM (Node Package Manager)** é o ecossistema que conecta você ao maior registro de código compartilhado do planeta, com mais de dois milhões de pacotes disponíveis.

Saber apenas digitar `npm install` não basta. Para se destacar como um desenvolvedor pleno e sênior, é indispensável dominar a fundo a anatomia do manifesto **`package.json`**, o versionamento semântico (**SemVer**), as travas de dependências do **`package-lock.json`** e a automação de rotinas via scripts.

---

## 1. O Manifesto `package.json`

O arquivo `package.json` é a certidão de nascimento de qualquer projeto Node.js. Ele descreve os metadados do projeto, suas dependências externas, versões suportadas e scripts executáveis.

Para gerar um arquivo `package.json` interativamente em uma nova pasta, usamos:
```bash
npm init
```
Ou para preencher todos os valores padrão imediatamente sem perguntas:
```bash
npm init -y
```

### Campos Essenciais do `package.json`:
* **`name`**: O identificador único do seu pacote (letras minúsculas, sem espaços).
* **`version`**: Versão atual do projeto seguindo a convenção SemVer (ex: `1.0.0`).
* **`type`**: Quando definido como `"module"`, habilita o suporte nativo a ES Modules (`import`/`export`).
* **`main`**: Ponto de entrada do pacote (geralmente `index.js` ou `./src/index.js`).
* **`bin`**: Mapeia comandos executáveis de terminal para ferramentas CLI (como `"tq-node": "./bin/index.js"`).
* **`scripts`**: Dicionário de comandos de automação do projeto.
* **`license`**: Termos de licença jurídica de uso (ex: `MIT`, `ISC`, `Apache-2.0`).

---

## 2. Tipos de Dependências: Produção vs Desenvolvimento

Nem todas as bibliotecas que você instala pertencem ao mesmo propósito. O NPM categoriza as dependências em seções distintas:

### A. Dependências de Produção (`dependencies`)
São as bibliotecas que o seu código precisa para funcionar enquanto a aplicação está rodando em produção pelo usuário final.
```bash
npm install chalk commander
```
Elas são salvas na chave `"dependencies"` do `package.json`.

### B. Dependências de Desenvolvimento (`devDependencies`)
São ferramentas utilizadas estritamente durante o desenvolvimento local pelo programador (formatadores de código, linters, bibliotecas de testes automatizados ou compiladores TypeScript). Elas não precisam ser carregadas em servidores de produção enxutos.
```bash
npm install -D nodemon eslint vitest
# (A flag -D é o atalho para --save-dev)
```
Elas são salvas na chave `"devDependencies"` do `package.json`.

### C. Execução Direta Sem Instalar com `npx`
Antigamente, para testar uma ferramenta ou gerador de projetos, era preciso instalá-la globalmente no computador (`npm install -g`). Hoje em dia, usamos o comando **`npx`** (*Node Package eXecutor*), que baixa, executa temporariamente e descarta o pacote sem poluir a máquina:
```bash
npx degit usuario/template meu-novo-projeto
```

---

## 3. Versionamento Semântico (SemVer: `MAJOR.MINOR.PATCH`)

O NPM adota o padrão internacional **SemVer** para números de versão estruturados como:
$$\text{MAJOR}.\text{MINOR}.\text{PATCH} \quad (\text{ex: } 2.4.1)$$

* **MAJOR (Maior - `2.x.x`):** Alterações que quebram a compatibilidade com versões anteriores (*breaking changes*).
* **MINOR (Menor - `x.4.x`):** Novas funcionalidades adicionadas de forma 100% retrocompatível.
* **PATCH (Correção - `x.x.1`):** Correções de bugs e segurança que não alteram a forma de usar a biblioteca.

### O Papel dos Prefixos no `package.json`:
* **Circunflexo (`^2.4.1` - Padrão do NPM):** Aceita atualizações automáticas de **Minor** e **Patch**, mas **bloqueia** quebras de versão Major (atualiza até `< 3.0.0`).
* **Til (`~2.4.1`):** Mais restritivo. Aceita apenas atualizações de **Patch** (atualiza até `< 2.5.0`).
* **Versão Exata (`2.4.1` sem prefixo):** Instala estritamente aquela versão específica.
* **Asterisco (`*`):** Aceita qualquer versão disponível (altamente arriscado e desencorajado em produção!).

---

## 4. O Mistério do `package-lock.json`

Uma das dúvidas mais frequentes de desenvolvedores novatos é: *"Posso deletar ou colocar o `package-lock.json` no `.gitignore`?"*.
A resposta é enfática: **NUNCA!**

O arquivo `package.json` define apenas regras de versões desejadas (geralmente com `^`). Se dois desenvolvedores rodarem `npm install` com semanas de diferença, o NPM pode baixar versões ligeiramente mais recentes de submódulos se baseando apenas no `package.json`.

O **`package-lock.json`** é gerado automaticamente pelo NPM para registrar a **árvore exata de resolução**: a URL de onde o pacote veio, a versão precisa de cada dependência aninhada e o hash de integridade criptográfica SHA-512 do arquivo baixado.

### O Comando `npm ci` em Servidores de Produção e CI/CD
Em esteiras de integração contínua (GitHub Actions, Docker) e servidores de produção, **não** se usa `npm install`. Utiliza-se:
```bash
npm ci
```
O `npm ci` (*Clean Install*) é muito mais rápido, remove a pasta `node_modules` existente e instala estritamente as versões idênticas travadas no `package-lock.json`, garantindo que o build de produção seja 100% reproduzível.

---

## 5. Automatizando Tarefas com Scripts do NPM

A seção `"scripts"` do `package.json` permite criar atalhos poderosos para tarefas recorrentes de terminal:

```json
{
  "scripts": {
    "start": "node bin/index.js",
    "dev": "node --watch bin/index.js",
    "test": "node --test tests/**/*.test.js",
    "limpar": "rm -rf dist node_modules"
  }
}
```

* **Comandos Nativos:** `start` e `test` podem ser executados diretamente sem a palavra `run` (`npm start`, `npm test`).
* **Comandos Personalizados:** Qualquer outro script requer a palavra `run` (`npm run dev`, `npm run limpar`).
* **Hooks de Ciclo de Vida:** O NPM suporta prefixos `pre` e `post` automáticos. Se você criar um script `"prestart"`, o NPM o executará automaticamente imediatamente antes do `"start"`.

---

## 6. Segurança e Manutenção de Pacotes

Bibliotecas de terceiros podem conter vulnerabilidades conhecidas de segurança reportadas no banco de dados de CVEs (*Common Vulnerabilities and Exposures*).

* **`npm audit`**: Faz uma varredura completa nas dependências do projeto e relata vulnerabilidades conhecidas com seus níveis de severidade.
* **`npm audit fix`**: Tenta atualizar automaticamente as dependências vulneráveis para versões corrigidas e compatíveis com a árvore do projeto.
* **`npm outdated`**: Lista quais dependências instaladas possuem versões mais recentes disponíveis no registro.

---

## 7. Boas Práticas Essenciais com o NPM

1. **Commit sempre o `package-lock.json` no Git:** Garante que todo membro da equipe rode o projeto no mesmo estado.
2. **Separe dependências de desenvolvimento com cuidado:** Não polua as dependências de produção com ferramentas como linters ou runners de testes.
3. **Use `node --watch` para desenvolvimento moderno:** A partir do Node.js 18+, você não precisa mais instalar dependências externas pesadas como o `nodemon` para reiniciar o servidor a cada alteração de arquivo; a flag nativa `--watch` já faz isso nativamente.
4. **Execute `npm audit` com frequência:** Manter suas dependências seguras é uma obrigação em qualquer ambiente profissional.

---
*Parabéns por concluir o Módulo 07! Agora você compreende a engenharia por trás do gerenciamento de pacotes e dependências no ecossistema Node.js. Teste seus conhecimentos no Quiz do Módulo 07!*
