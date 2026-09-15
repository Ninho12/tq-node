# Módulo 02: O Módulo `path` e Manipulação de Caminhos no Node.js

Bem-vindo ao segundo módulo do **tq-node**! Hoje vamos explorar uma das ferramentas mais importantes para qualquer desenvolvedor Node.js: o módulo nativo **`path`**. 

Se você já tentou manipular caminhos de arquivos em diferentes sistemas operacionais (como Windows, Linux e macOS), sabe que cada um deles lida com as barras de diretórios de formas distintas. O módulo `path` resolve esse problema de forma elegante e segura.

---

## 1. O Problema das Barras de Diretório (`/` vs `\`)

Imagine que você está construindo um script que precisa ler um arquivo dentro de uma pasta chamada `dados` e o arquivo se chama `usuario.json`.

No **Linux** e **macOS**, os caminhos utilizam a barra normal (`/`):
```text
dados/usuario.json
```

No **Windows**, o padrão histórico utiliza a barra invertida (`\`):
```text
dados\usuario.json
```

Se você escrever caminhos fixos usando strings simples no seu código, a sua aplicação vai funcionar perfeitamente no seu computador de desenvolvimento, mas pode quebrar completamente quando for executada no servidor de produção de um colega ou em um ambiente de nuvem diferente. É exatamente para evitar esse tipo de dor de cabeça que o Node.js fornece o módulo nativo `path`.

---

## 2. Como Importar o Módulo `path`

Por ser um módulo nativo do Node.js, você não precisa instalar nada via NPM. Basta importá-lo no início do seu arquivo JavaScript:

```javascript
import path from 'path';
// Ou se estiver usando CommonJS antigo:
// const path = require('path');
```

Vamos conhecer agora as funções mais utilizadas no dia a dia de desenvolvimento.

---

## 3. Principais Funções do Módulo `path`

### A. `path.join([...paths])`
A função `path.join()` une todos os segmentos de caminho dados usando o separador específico do sistema operacional como delimitador, além de normalizar o resultado (removendo barras duplicadas ou pontos desnecessários como `..`).

```javascript
import path from 'path';

// Exemplo prático de junção segura de diretórios
const caminhoCompleto = path.join('src', 'config', '..', 'data', 'banco.json');

console.log(caminhoCompleto);
// No Linux/macOS: src/data/banco.json
// No Windows: src\data\banco.json
```
*Note que ele interpretou o `..` voltando uma pasta e limpou o caminho automaticamente.*

### B. `path.resolve([...paths])`
Enquanto o `path.join` apenas une os pedaços, o `path.resolve()` processa uma sequência de caminhos resolvendo-os a partir de um **caminho absoluto** (começando sempre a partir da raiz do seu sistema operacional).

```javascript
import path from 'path';

const caminhoAbsoluto = path.resolve('index.js');
console.log(caminhoAbsoluto);
// Exemplo de saída: /home/usuario/projetos/tq-node/index.js
```
Esta função é extremamente útil quando precisamos garantir que o Node.js encontre um arquivo independentemente de onde o script foi acionado no terminal.

### C. `path.basename(path[, ext])`
Retorna a **última parte** de um caminho (geralmente o nome do arquivo). Você também pode passar opcionalmente a extensão como segundo argumento para removê-la da string final.

```javascript
import path from 'path';

const arquivo = '/home/usuario/projetos/tq-node/package.json';

console.log(path.basename(arquivo)); 
// Saída: package.json

console.log(path.basename(arquivo, '.json')); 
// Saída: package
```

### D. `path.dirname(path)`
Retorna o **diretório raiz** (o caminho da pasta pai) de um arquivo ou caminho especificado.

```javascript
import path from 'path';

const arquivo = '/home/usuario/projetos/tq-node/src/index.js';

console.log(path.dirname(arquivo));
// Saída: /home/usuario/projetos/tq-node/src
```

### E. `path.extname(path)`
Retorna a **extensão do arquivo** (contendo o ponto final `.` se houver).

```javascript
import path from 'path';

console.log(path.extname('index.html')); // Saída: .html
console.log(path.extname('script.js'));   // Saída: .js
console.log(path.extname('README'));     // Saída: (vazio)
```

---

## 4. O Caso Especial do ES Modules (`__dirname` e `__filename`)

Se você estiver utilizando o padrão moderno do JavaScript (`import` / `export` com `"type": "module"` no `package.json`), você deve ter percebido que as variáveis globais `__dirname` e `__filename` **não existem nativamente** no escopo do arquivo.

Para obter o caminho da pasta atual usando ES Modules, fazemos uso combinado dos módulos `path` e `url`:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

// Descobre o arquivo atual e o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Diretório atual:', __dirname);
console.log('Arquivo atual:', __filename);
```
Esse padrão é amplamente utilizado em aplicações Node.js modernas para carregar arquivos estáticos, templates ou bancos de dados locais baseados em JSON com segurança absoluta.

---

## 5. Boas Práticas ao Usar o Módulo `path`

1. **Nunca concatene caminhos manualmente com strings (`+` ou template strings `${}`):** Evite escrever `pasta + '/' + arquivo`. Se o código rodar no Windows, a barra pode ficar invertida ou duplicada.
2. **Prefira `path.join` para montar rotas internas:** Sempre que precisar caminhar entre pastas do projeto, passe os níveis como argumentos separados para a função `path.join()`.
3. **Valide extensões quando receber arquivos de usuários:** Use `path.extname()` para garantir que o upload ou leitura de um arquivo corresponda estritamente ao formato esperado (ex: `.jpg`, `.json`).

---
*Parabéns por concluir o Módulo 02! Compreender a manipulação de caminhos evita centenas de erros de arquivos não encontrados (`ENOENT`) nas suas aplicações. Agora teste seus conhecimentos executando o quiz correspondente!*
