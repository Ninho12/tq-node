# Módulo 08: Streams e Buffers: Manipulação Eficiente de Dados Pesados

Bem-vindo ao oitavo módulo do **tq-node**! Até agora, manipulamos arquivos e dados carregando tudo diretamente na memória com métodos como `fs.readFile()` ou `JSON.parse()`. 

Isso funciona perfeitamente para arquivos de texto pequenos ou configurações JSON de alguns kilobytes. Mas o que acontece se a sua aplicação precisar processar um arquivo de log de 8 Gigabytes, um upload de vídeo em alta resolução ou um relatório massivo de banco de dados em um servidor que possui apenas 1 Gigabyte de memória RAM disponível?

Se você tentar carregar tudo de uma só vez na memória, o Node.js disparará um erro fatal de estouro de heap (*JavaScript heap out of memory*) e o seu servidor cairá imediatamente. É para resolver essa limitação fundamental que existem os **Buffers** e as **Streams**.

---

## 1. O que são Buffers no Node.js?

O JavaScript no navegador foi concebido para lidar principalmente com strings de texto. Porém, no lado do servidor, o Node.js precisa interagir continuamente com arquivos binários brutos (imagens, vídeos, pacotes TCP de rede, arquivos compactados em zip).

A classe nativa **`Buffer`** (disponível globalmente sem necessidade de `import`) representa uma sequência fixa de bytes alocada em memória física fora do motor V8 do JavaScript.

### Operações Essenciais com Buffers:

```javascript
// 1. Criando um Buffer a partir de uma string de texto
const bufTexto = Buffer.from('Node.js é incrível!', 'utf-8');
console.log(bufTexto); 
// Exibe bytes hexadecimais: <Buffer 4e 6f 64 65 2e 6a 73 ...>

// 2. Convertendo o Buffer de volta para texto legível
console.log(bufTexto.toString('utf-8')); // Node.js é incrível!

// 3. Convertendo para outras codificações (ex: Base64 para envio em APIs)
const base64 = bufTexto.toString('base64');
console.log('Em Base64:', base64);

// 4. Alocando um espaço de memória vazio com tamanho fixo
const memoriaReservada = Buffer.alloc(1024); // Aloca 1 KB de zeros
```

---

## 2. O Conceito de Streams: O Modelo da Esteira

Em vez de esperar que um arquivo inteiro de 5 GB seja lido do disco para a memória RAM para só então começar a processá-lo, as **Streams** processam a informação em **pedaços sequenciais contínuos** chamados de **chunks** (tipicamente buffers de 64 KB).

Pense em um serviço de streaming de vídeo como a Netflix ou o YouTube: você não precisa baixar o filme de 4K inteiro (20 GB) para começar a assistir; você consome os primeiros pedaços (*chunks*) enquanto o restante do vídeo continua sendo transferido em segundo plano.

### Vantagens das Streams:
* **Eficiência Espacial (Memória):** Você pode processar um arquivo de 50 GB consumindo apenas cerca de 20 a 50 MB de memória RAM constante!
* **Eficiência Temporal (Tempo):** Você pode começar a processar e enviar os dados para o usuário imediatamente, sem esperar a leitura completa do disco.

---

## 3. Os Quatro Tipos de Streams no Node.js

O módulo nativo `node:stream` divide as streams em quatro categorias:

| Tipo | Descrição | Exemplos Reais no Node.js |
| :--- | :--- | :--- |
| **Readable** | Fluxo de onde os dados podem ser **lidos** | `fs.createReadStream()`, `req` (HTTP), `process.stdin` |
| **Writable** | Fluxo para onde os dados podem ser **gravados** | `fs.createWriteStream()`, `res` (HTTP), `process.stdout` |
| **Duplex** | Fluxo que pode tanto **ler quanto escrever** simultaneamente | Sockets de rede TCP (`net.Socket`) |
| **Transform** | Duplex especial que **modifica os dados** enquanto eles trafegam | Compressão (`zlib.createGzip()`), Criptografia (`crypto`) |

---

## 4. O Encanamento Perfeito: `pipe` vs `pipeline`

Para conectar uma fonte de leitura (*Readable*) diretamente a um destino de escrita (*Writable*), usamos o conceito de "encanamento" (*piping*).

### O Método Tradicional: `.pipe()`
```javascript
import fs from 'node:fs';

const leitura = fs.createReadStream('origem.mp4');
const escrita = fs.createWriteStream('destino.mp4');

// Conecta a leitura diretamente na escrita
leitura.pipe(escrita);
```
*⚠️ **Atenção:** O método clássico `.pipe()` possui um defeito histórico conhecido: se ocorrer um erro durante a transmissão (ex: disco cheio), ele não fecha as streams automaticamente, podendo causar vazamento de memória (*memory leaks*).*

### A Abordagem Moderna Recomendada: `pipeline` com Promises
A partir das versões recentes do Node.js, a função **`pipeline`** do submódulo `node:stream/promises` é o padrão ouro: ela fecha automaticamente todos os recursos em caso de falha e integra-se perfeitamente com `async/await` e `try...catch`.

Veja um exemplo impressionante de como ler um arquivo gigante, compactá-lo em formato `.gz` em tempo real e gravá-lo no disco:

```javascript
import fs from 'node:fs';
import zlib from 'node:zlib';
import { pipeline } from 'node:stream/promises';

async function compactarArquivo(origem, destino) {
  try {
    console.log('Iniciando compactação via streaming...');

    await pipeline(
      fs.createReadStream(origem),       // 1. Readable: Lê o arquivo em pedaços
      zlib.createGzip(),                // 2. Transform: Compacta os pedaços em gzip
      fs.createWriteStream(destino)     // 3. Writable: Grava no arquivo .gz
    );

    console.log('Compactação finalizada com consumo mínimo de RAM!');
  } catch (erro) {
    console.error('Falha no pipeline de streaming:', erro.message);
  }
}

await compactarArquivo('log-imenso.txt', 'log-imenso.txt.gz');
```

---

## 5. O Conceito de *Backpressure* (Contrapressão)

Imagine que a sua fonte de leitura consegue ler do disco rápido a 500 MB/s, mas o seu destino de escrita é uma conexão lenta de rede transmitindo a apenas 1 MB/s.

Se a fonte continuar despejando dados sem freio, os pedaços acumularão na memória RAM do servidor até derrubar a aplicação. Essa resistência do destino é chamada de **Backpressure (Contrapressão)**.

Ao utilizar `pipeline()` ou `.pipe()`, o Node.js gerencia o backpressure de forma 100% automática: quando o destino fica sobrecarregado, o Node.js pausa temporariamente a leitura da fonte. Assim que o buffer de saída é esvaziado (evento `'drain'`), ele retoma a leitura.

---

## 6. Boas Práticas ao Trabalhar com Streams

1. **Nunca use `fs.readFile` para arquivos desconhecidos ou grandes:** Se o tamanho do arquivo puder passar de alguns megabytes, use sempre `fs.createReadStream`.
2. **Priorize `stream/promises` com `pipeline`:** Evite encadeamentos manuais de `.pipe()` para evitar vazamentos de memória em falhas de rede ou disco.
3. **Trate o encoding conscientemente:** Se estiver trabalhando com texto, defina o encoding na stream (`fs.createReadStream('arq.txt', { encoding: 'utf-8' })`). Caso contrário, manipule os buffers brutos.

---
*Parabéns por concluir o Módulo 08! O domínio de Buffers e Streams é o divisor de águas que qualifica você para trabalhar com sistemas de alta performance e volumes massivos de dados no Node.js. Agora teste sua retenção no Quiz do Módulo 08!*
