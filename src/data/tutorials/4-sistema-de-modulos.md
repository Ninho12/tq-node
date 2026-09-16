# Módulo 04: Sistema de Módulos no Node.js: CommonJS vs ES Modules

Bem-vindo ao quarto módulo do **tq-node**! Modularizar código é a espinha dorsal de qualquer aplicação escalável. Em projetos reais, dividir sua lógica em arquivos independentes e reutilizáveis garante manutenibilidade, legibilidade e testes eficientes.

No universo do Node.js, no entanto, existe uma peculiaridade histórica fascinante: a convivência entre dois sistemas de módulos distintos: **CommonJS (CJS)** e **ECMAScript Modules (ESM)**. Compreender como eles funcionam, suas regras, limitações e como transitar entre eles é um requisito fundamental para qualquer desenvolvedor Node.js profissional.

---

## 1. Contexto Histórico: De Onde Vieram os Módulos?

Nos primórdios do JavaScript no navegador, não existia um sistema nativo de módulos. Para organizar códigos, desenvolvedores dependiam de tags `<script>` ordenadas manualmente no HTML e padrões como IIFE (*Immediately Invoked Function Expressions*) para evitar poluir o escopo global (`window`).

Quando o Node.js foi criado em 2009 por Ryan Dahl para rodar JavaScript no lado do servidor, a necessidade de um sistema de módulos robusto era urgente. A equipe do Node.js adotou o padrão da comunidade chamado **CommonJS**.

Anos mais tarde, em 2015, a especificação oficial do JavaScript (ECMAScript 2015 ou ES6) finalmente padronizou uma sintaxe nativa de módulos para toda a linguagem: os **ES Modules** (`import` e `export`). A partir daí, o Node.js iniciou uma transição cuidadosa para suportar a especificação oficial mantendo a retrocompatibilidade com bilhões de linhas de código CommonJS já existentes no ecossistema NPM.

---

## 2. CommonJS (CJS) — O Padrão Clássico

O CommonJS ainda é amplamente encontrado em bases de código legadas, scripts corporativos e em muitos pacotes do NPM.

### Sintaxe Básica
Para exportar valores no CJS, utilizamos o objeto especial `module.exports` (ou o atalho `exports`):

```javascript
// utilidades.js (CommonJS)
function somar(a, b) {
  return a + b;
}

function subtrair(a, b) {
  return a - b;
}

module.exports = {
  somar,
  subtrair
};
```

Para consumir esses módulos em outro arquivo, utilizamos a função global `require()`:

```javascript
// app.js (CommonJS)
const { somar, subtrair } = require('./utilidades.js');

console.log(somar(10, 5)); // 15
```

### Como o CJS Funciona por Baixo dos Panos
Ao carregar um arquivo CommonJS, o Node.js envolve todo o conteúdo do arquivo em uma função executora oculta (*Module Wrapper*):

```javascript
(function (exports, require, module, __filename, __dirname) {
  // O seu código do arquivo roda exatamente aqui dentro!
});
```
É exatamente por causa dessa função interna invisível que variáveis como `__dirname`, `__filename`, `module` e `require` parecem "globais", embora na verdade sejam parâmetros injetados pelo Node.js.

### Características do CJS:
* **Carregamento Síncrono:** O `require()` lê o arquivo no disco de forma bloqueante no momento em que a linha é executada.
* **Avaliação em Tempo de Execução (*Runtime*):** Você pode chamar `require()` dinamicamente dentro de declarações `if`, funções ou laços de repetição (`if (condicao) require('./modulo')`).
* **Cache em Memória:** Módulos requeridos são cacheados no objeto `require.cache`. Novas chamadas ao mesmo arquivo retornam a mesma instância sem reler o disco.

---

## 3. ES Modules (ESM) — O Padrão Moderno e Oficial

O ECMAScript Modules (ESM) é a sintaxe oficial padronizada pelo comitê TC39, suportada nativamente por navegadores modernos, pelo Node.js, Deno e Bun.

### Sintaxe Básica
No ESM, utilizamos as palavras-chave `import` e `export`:

```javascript
// matematica.js (ES Modules)
export function multiplicar(a, b) {
  return a * b;
}

export const PI = 3.14159;

export default function dividir(a, b) {
  if (b === 0) throw new Error('Divisão por zero!');
  return a / b;
}
```

Para importar:

```javascript
// main.js (ES Modules)
import dividir, { multiplicar, PI } from './matematica.js';

console.log(multiplicar(6, 7)); // 42
console.log(dividir(10, 2));     // 5
```

### Características do ESM:
* **Análise Estática (*Static Analysis*):** As instruções `import` e `export` são processadas antes da execução do código. A ferramenta consegue verificar antecipadamente se o módulo ou função exportada realmente existe, possibilitando otimizações como *Tree Shaking* (remoção de código morto).
* **Carregamento Assíncrono:** O grafo de dependências é resolvido de forma assíncrona antes da execução.
* **Extensões Obrigatórias:** No Node.js com ESM nativo, você deve sempre especificar a extensão do arquivo no caminho relativo (ex: `./modulo.js`, e não apenas `./modulo`).

---

## 4. Como Ativar o ESM no Node.js

Por padrão, o Node.js trata arquivos `.js` como CommonJS. Para informar ao Node.js que você deseja trabalhar com ES Modules, existem duas abordagens:

### Abordagem 1: Configuração no `package.json` (Recomendada)
Adicione a propriedade `"type": "module"` no arquivo `package.json` raiz do seu projeto:

```json
{
  "name": "meu-projeto",
  "version": "1.0.0",
  "type": "module"
}
```
Com isso, todos os arquivos com extensão `.js` dentro do projeto serão interpretados como ES Modules.

### Abordagem 2: Extensões Explícitas (`.mjs` vs `.cjs`)
Independentemente do valor da chave `"type"` no `package.json`:
* Arquivos `.mjs` são sempre tratados como **ES Modules**.
* Arquivos `.cjs` são sempre tratados como **CommonJS**.

---

## 5. Diferenças Críticas e Armadilhas Comuns

### A. Onde foram parar `__dirname` e `__filename`?
Como o ESM não utiliza a função *Module Wrapper* do CommonJS, as variáveis `__dirname` e `__filename` simplesmente **não existem**. A forma correta de obtê-las no ESM é combinando `import.meta.url` com o módulo `node:url` e `node:path`:

```javascript
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### B. Top-Level Await
No ESM, você pode usar a palavra-chave `await` diretamente no escopo principal do arquivo, sem precisar envolver tudo dentro de uma função `async function main() {}`:

```javascript
// Válido nativamente em ES Modules!
import fs from 'node:fs/promises';

const dados = await fs.readFile('./dados.txt', 'utf-8');
console.log(dados);
```
No CommonJS clássico, tentar usar `await` fora de uma função `async` resulta em um erro de sintaxe imediato.

### C. Importando CJS a partir de ESM
Você pode importar módulos CommonJS dentro de um arquivo ESM normalmente com a instrução `import`:
```javascript
import chalk from 'chalk'; // Pacote externo
import fs from 'node:fs';  // Módulo nativo
```

### D. Importando ESM a partir de CJS
O contrário, no entanto, exige atenção: você não pode usar `require()` para carregar um módulo puramente ESM (como as versões mais recentes dos pacotes `chalk` ou `node-fetch`). Nesses casos, o CJS é obrigado a usar a função assíncrona `import()` dinâmico:

```javascript
// Em um arquivo CommonJS:
async function carregarPacoteModerno() {
  const chalk = (await import('chalk')).default;
  console.log(chalk.green('Carregado via import() dinâmico!'));
}
```

---

## 6. Comparativo Rápido: CJS vs ESM

| Característica | CommonJS (CJS) | ES Modules (ESM) |
| :--- | :--- | :--- |
| **Sintaxe** | `require()` / `module.exports` | `import` / `export` |
| **Padrão** | Criado pela comunidade Node.js (2009) | Padrão oficial da linguagem JS (TC39) |
| **Resolução** | Dinâmica em tempo de execução | Estática em tempo de compilação/parse |
| **Top-Level Await** | ❌ Não suportado | ✅ Suportado nativamente |
| **Variáveis Globais** | Injeta `__dirname` e `__filename` | Exige `import.meta.url` |
| **Tree Shaking** | Complexo / Limitado | Altamente otimizado |
| **Configuração** | Padrão sem `"type"` | `"type": "module"` no `package.json` |

---

## 7. Boas Práticas

1. **Adote ESM para novos projetos:** Sempre configure `"type": "module"` no `package.json`. Essa é a direção de todo o ecossistema moderno do JavaScript.
2. **Sempre inclua extensões de arquivos:** Ao importar módulos locais em ESM, use `import { foo } from './foo.js'`. A omissão de extensões pode falhar em ambientes estritos de produção.
3. **Evite misturar CJS e ESM no mesmo projeto sem necessidade:** Manter um padrão único reduz complexidade de build e incompatibilidades com ferramentas de empacotamento (*bundlers*).

---
*Parabéns por concluir o Módulo 04! Compreender as nuances entre CommonJS e ES Modules evita dezenas de erros de importação e prepara você para arquitetar projetos modernos com confiança. Agora, teste seu conhecimento no Quiz do Módulo 04!*
