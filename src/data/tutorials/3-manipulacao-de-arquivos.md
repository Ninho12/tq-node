# Módulo 03: Manipulação de Arquivos no Node.js com o Módulo `fs`

Bem-vindo ao terceiro módulo do **tq-node**! Agora que você já domina a resolução e normalização de caminhos com o módulo `path`, é hora de interagir diretamente com o disco: criar, ler, atualizar e excluir arquivos e pastas no seu computador ou servidor.

Para isso, o Node.js disponibiliza o módulo nativo **`fs`** (*File System*). Ele é um dos módulos mais fundamentais e poderosos de todo o ecossistema Node.js, servindo de alicerce para ferramentas de linha de comando, servidores web, parsers de configuração e sistemas de persistência em arquivos.

---

## 1. Como Importar o Módulo `fs`

Por ser nativo, o `fs` não requer nenhuma instalação via NPM. Nas versões modernas do Node.js, recomenda-se utilizar o prefixo de protocolo `node:` para explicitar a importação de módulos nativos do sistema:

```javascript
// Importação da API baseada em Promises (Recomendada)
import fs from 'node:fs/promises';

// Importação da API síncrona/callbacks tradicional (se necessário)
import fsClassic from 'node:fs';
```

---

## 2. Os Três Paradigmas do `fs`: Síncrono, Callbacks e Promises

Historicamente, o Node.js evoluiu e hoje oferece três formas distintas de trabalhar com operações de sistema de arquivos. Entender a diferença entre elas é crucial para a performance de suas aplicações.

### A. Métodos Síncronos (`fs.readFileSync`, `fs.writeFileSync`)
Os métodos que terminam com o sufixo `Sync` executam a operação de leitura ou escrita pausando a execução de qualquer outro código JavaScript na thread principal até que o disco termine de processar.
* **Vantagem:** Fluxo de leitura simples e linear, ideal para scripts rápidos de CLI ou para ler configurações na inicialização da aplicação antes de subir um servidor.
* **Desvantagem crítica:** Em servidores web ou tarefas com concorrência, o método síncrono trava o Event Loop, impedindo que qualquer outro cliente seja atendido.

### B. Métodos com Callbacks (`fs.readFile(caminho, callback)`)
Foi o padrão inicial do Node.js por muitos anos. Adota a convenção *Error-First Callback*, onde o primeiro parâmetro da função de retorno é reservado para um eventual erro (`err`) e o segundo contém o resultado.
* Embora não trave o Event Loop, encadear múltiplas operações com callbacks pode gerar o conhecido *Callback Hell*, tornando o código difícil de manter.

### C. Métodos com Promises (`node:fs/promises`) — O Padrão Moderno
Introduzido para modernizar o Node.js, o submódulo `fs/promises` disponibiliza versões de quase todas as operações retornando `Promises`.
* **Vantagem:** Integração perfeita com `async/await`, código limpo, tratamento de erros elegante com blocos `try...catch` e total compatibilidade com o Event Loop sem travar a thread principal.

---

## 3. Lendo Arquivos: Texto vs Buffer

Ao ler um arquivo com `fs.promises.readFile()`, você deve prestar atenção no parâmetro de codificação (*encoding*).

Se o *encoding* for omitido, o Node.js retornará os dados no formato bruto **`Buffer`** (uma sequência binária de bytes). Para receber o conteúdo diretamente como texto manipulável, você deve informar `'utf-8'`.

```javascript
import fs from 'node:fs/promises';
import path from 'node:path';

async function lerConfiguracao() {
  try {
    const caminho = path.resolve('package.json');
    
    // Passamos 'utf-8' para receber uma string pronta
    const dados = await fs.readFile(caminho, 'utf-8');
    const json = JSON.parse(dados);
    
    console.log(`Projeto: ${json.name} (v${json.version})`);
  } catch (erro) {
    if (erro.code === 'ENOENT') {
      console.error('Arquivo não encontrado!');
    } else {
      console.error('Erro ao ler arquivo:', erro.message);
    }
  }
}

lerConfiguracao();
```

---

## 4. Criando e Escrevendo Arquivos

### A. `fs.promises.writeFile(caminho, dados[, opcoes])`
O método `writeFile` grava dados em um arquivo. Se o arquivo já existir, ele será **completamente substituído** por padrão. Se não existir, ele será criado automaticamente.

```javascript
import fs from 'node:fs/promises';

async function salvarRelatorio() {
  try {
    const conteudo = 'Status: Sucesso\nTotal de registros: 42\n';
    await fs.writeFile('relatorio.txt', conteudo, 'utf-8');
    console.log('Arquivo gravado com sucesso!');
  } catch (erro) {
    console.error('Falha ao escrever:', erro);
  }
}
```

### B. `fs.promises.appendFile(caminho, dados[, opcoes])`
Quando o objetivo é **adicionar** novos dados ao final de um arquivo existente sem apagar o que já estava gravado (como em sistemas de logs ou históricos), utilizamos o `appendFile`.

```javascript
import fs from 'node:fs/promises';

async function registrarLog(mensagem) {
  const linha = `[${new Date().toISOString()}] ${mensagem}\n`;
  await fs.appendFile('app.log', linha, 'utf-8');
}
```

---

## 5. Trabalhando com Pastas e Metadados

Manipular diretórios é parte essencial de qualquer script avançado de linha de comando.

### A. Criando Pastas Recursivas com `mkdir`
Se você tentar criar uma pasta dentro de uma estrutura inexistente (ex: `logs/2026/09`), o Node.js lançará um erro `ENOENT`. Para criar toda a hierarquia de pastas automaticamente, use a opção `{ recursive: true }`:

```javascript
import fs from 'node:fs/promises';

async function inicializarEstrutura() {
  await fs.mkdir('temp/backups/diarios', { recursive: true });
  console.log('Diretórios criados com sucesso!');
}
```

### B. Listando Conteúdo de Pastas com `readdir`
O método `readdir` retorna um array com os nomes de todos os itens contidos em um diretório:

```javascript
import fs from 'node:fs/promises';

async function listarArquivos() {
  const itens = await fs.readdir('./src');
  console.log('Itens encontrados:', itens);
}
```

### C. Inspecionando Metadados com `stat`
O método `stat` retorna um objeto `Stats` com informações detalhadas: tamanho do arquivo em bytes, data de criação, permissões e métodos utilitários:

```javascript
import fs from 'node:fs/promises';

async function inspecionarItem(caminho) {
  const status = await fs.stat(caminho);
  
  console.log(`Tamanho: ${status.size} bytes`);
  console.log(`É um arquivo comum?`, status.isFile());
  console.log(`É um diretório?`, status.isDirectory());
}
```

### D. Deletando Arquivos e Diretórios
* **Deletar arquivo:** `await fs.unlink('caminho/arquivo.txt');`
* **Deletar diretório (e todo seu conteúdo recursivamente):**
  ```javascript
  await fs.rm('pasta-temporaria', { recursive: true, force: true });
  ```

---

## 6. Tratamento de Erros e Códigos do Sistema

Quando uma operação de disco falha, o Node.js anexa um código identificador (`erro.code`) ao objeto de erro. Os mais comuns são:
* **`ENOENT`** (*Error NO ENTry*): O arquivo ou diretório especificado não existe no caminho informado.
* **`EACCES`** / **`EPERM`**: Permissão negada para ler ou gravar no local indicado.
* **`EEXIST`**: Tentativa de criar algo exclusivo que já existe (como diretórios sem a flag recursive).

### ⚠️ O Antipadrão da Checagem Prévia (Race Conditions / TOCTOU)
Um erro comum entre iniciantes é checar se o arquivo existe antes de tentar lê-lo:
```javascript
// ❌ EVITE FAZER ISSO:
if (fsClassic.existsSync(caminho)) {
  const dados = await fs.readFile(caminho); // Outro processo pode apagar o arquivo entre essas duas linhas!
}

// ✅ BOA PRÁTICA: Tente a operação diretamente e capture o erro
try {
  const dados = await fs.readFile(caminho, 'utf-8');
} catch (erro) {
  if (erro.code === 'ENOENT') {
    // Tratar ausência do arquivo com segurança
  }
}
```
Esse problema é conhecido no meio da segurança e engenharia de software como **TOCTOU** (*Time of Check to Time of Use*).

---

## 7. Boas Práticas Essenciais com o `fs`

1. **Sempre combine `fs` com o módulo `path`:** Nunca utilize barras manuais na montagem dos caminhos passados às funções do `fs`.
2. **Priorize `node:fs/promises` em aplicações modernas:** Facilita a leitura e garante que sua aplicação permaneça responsiva e escalável.
3. **Restrinja métodos `*Sync` a etapas isoladas:** Use métodos síncronos apenas em scripts descartáveis ou durante o bootstrapping do seu CLI antes de qualquer interação com o usuário.
4. **Sempre passe o encoding explícito ao ler texto:** Usar `utf-8` evita a necessidade de chamar manualmente `buffer.toString()`.

---
*Parabéns por concluir o Módulo 03! Dominar o File System abre as portas para criar aplicações reais, automatizar rotinas e gerenciar arquivos com maestria. Agora, teste sua retenção respondendo ao Quiz do Módulo 03!*
