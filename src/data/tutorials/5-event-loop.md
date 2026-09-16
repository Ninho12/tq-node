# Módulo 05: O Event Loop e a Assincronicidade no Node.js

Bem-vindo ao quinto módulo do **tq-node**! Se existe um conceito que define o coração do Node.js e separa desenvolvedores iniciantes de engenheiros seniores, é o **Event Loop** (*Ciclo de Eventos*).

Muitos desenvolvedores sabem que o Node.js é "assíncrono e não-bloqueante", mas poucos entendem exatamente como o runtime gerencia milhares de conexões simultâneas usando apenas uma única thread principal de execução. Neste módulo, vamos abrir o capô do Node.js e dissecar o funcionamento interno do Event Loop.

---

## 1. O Modelo de Concorrência do Node.js

Tradicionalmente, servidores web como o Apache criavam uma nova thread do sistema operacional para cada requisição de usuário recebida. Se mil usuários acessassem a página ao mesmo tempo, o servidor precisava manter mil threads alocadas na memória, cada uma consumindo recursos e disputando o processador.

O criador do Node.js, Ryan Dahl, propôs um modelo diferente: o **Single-Threaded Non-Blocking I/O**.
* O código JavaScript do desenvolvedor executa em uma **única thread principal**.
* Operações pesadas de entrada e saída (como ler o disco, consultar o banco de dados ou esperar uma resposta de rede) são delegadas ao sistema operacional ou à biblioteca nativa em C/C++ chamada **libuv**.
* Enquanto o disco ou a rede trabalham em segundo plano, a thread principal fica 100% livre para atender novas requisições. Quando a operação em segundo plano termina, o resultado é colocado em uma fila para ser processado pelo JavaScript.

---

## 2. A Estrutura Básica: Call Stack e Background

Para entender o fluxo, pense em três componentes fundamentais:
1. **Call Stack (Pilha de Chamadas):** Onde o código JavaScript síncrono é empilhado e executado (LIFO - *Last In, First Out*). Se você chamar uma função que chama outra, elas se empilham aqui.
2. **libuv (Thread Pool e APIs do SO):** O mecanismo nos bastidores que cuida de tarefas de I/O assíncronas do sistema e operações com threads em segundo plano (como certas rotinas de criptografia e compactação).
3. **Task Queues (Filas de Tarefas):** Onde os callbacks prontos aguardam para serem puxados de volta para a Call Stack assim que ela estiver completamente vazia.

O papel do **Event Loop** é atuar como um despachante vigilante: ele verifica continuamente se a Call Stack está vazia. Se estiver, ele busca o próximo callback pronto na fila e o envia para a execução.

---

## 3. As Fases do Event Loop no Node.js

O Event Loop do Node.js não é uma fila simples e única. Ele é dividido em **seis fases bem definidas** executadas em ordem cíclica:

```text
   ┌───────────────────────────┐
┌─>│          Timers           │  -> setTimeout(), setInterval()
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     Pending Callbacks     │  -> Erros de rede, I/O pendentes do SO
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       Idle, Prepare       │  -> Uso exclusivamente interno
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           Poll            │  -> Recupera novos eventos de I/O e executa callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           Check           │  -> setImmediate()
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │      Close Callbacks      │  -> socket.on('close', ...)
└──┴───────────────────────────┘
```

### 1. Timers
Esta fase executa os callbacks agendados por `setTimeout()` e `setInterval()` cujo tempo limite já expirou.

### 2. Pending Callbacks
Executa callbacks de operações do sistema que foram postergadas de ciclos anteriores (como certos erros de conexões de rede `ECONNREFUSED`).

### 3. Idle, Prepare
Fase de uso estritamente interno da biblioteca libuv para preparação do ciclo seguinte.

### 4. Poll (A fase central)
É a fase onde o Node.js passa a maior parte do seu tempo:
* Ele calcula quanto tempo deve esperar e bloqueia aguardando novas operações de I/O terminarem (leituras de arquivos, conexões HTTP chegando).
* Processa os eventos e executa os callbacks dessa fila de I/O.

### 5. Check
Fase dedicada exclusivamente a executar callbacks agendados com a função nativa `setImmediate()`.

### 6. Close Callbacks
Executa callbacks de finalização, como o evento de fechamento de conexões e sockets (`socket.on('close', ...)`).

---

## 4. Microtarefas: Onde entram Promises e `process.nextTick()`?

Existe uma prioridade especial que **não faz parte** das 6 fases do Event Loop, mas é executada entre as fases: a fila de **Microtasks**.

As microtarefas são divididas em duas filas com prioridades distintas:
1. **Fila do `process.nextTick()`:** Possui a **maior prioridade** de todo o Node.js. Qualquer callback passado para `process.nextTick()` é executado imediatamente após a operação corrente terminar, antes que o Event Loop passe para a próxima fase.
2. **Fila de Microtasks de Promises:** Executa os callbacks de Promises resolvidas (`.then()`, `.catch()`, `.finally()` e retomadas de `await`).

### ⚠️ Cuidado com a Inanição (*Starvation*):
Se você chamar `process.nextTick()` recursivamente em um loop infinito, você causará a inanição (*starvation*) do Event Loop, impedindo completamente que as fases de timers, poll e I/O recebam qualquer ciclo da CPU!

---

## 5. Exemplo Prático: Desvendando a Ordem de Execução

Observe o código abaixo e tente prever a saída no terminal:

```javascript
import fs from 'node:fs';

console.log('1. Início síncrono');

setTimeout(() => {
  console.log('2. setTimeout 0ms');
}, 0);

setImmediate(() => {
  console.log('3. setImmediate');
});

Promise.resolve().then(() => {
  console.log('4. Promise resolvida (Microtask)');
});

process.nextTick(() => {
  console.log('5. process.nextTick (Microtask prioritária)');
});

console.log('6. Fim síncrono');
```

### Ordem de Saída Real:
1. `1. Início síncrono` (Call Stack direta)
2. `6. Fim síncrono` (Call Stack direta)
3. `5. process.nextTick` (Esvazia a fila de nextTick antes de avançar)
4. `4. Promise resolvida` (Esvazia a fila de Microtasks de Promises)
5. `2. setTimeout 0ms` ou `3. setImmediate` (Na raiz do arquivo, a ordem entre timer e immediate pode variar devido à latência de clock do SO; mas dentro de um ciclo de I/O, `setImmediate` sempre executa primeiro!).

---

## 6. O que Trava o Node.js? (*Don't Block the Event Loop*)

O lema sagrado dos desenvolvedores Node.js é: **"Não bloqueie o Event Loop!"**.

Como o código JavaScript roda em uma thread única, qualquer processamento de CPU extremamente intensivo impedirá o Event Loop de girar. Exemplos perigosos:
* Fazer parsing síncrono de arquivos JSON com centenas de megabytes (`JSON.parse()`).
* Expressões Regulares mal construídas que causam *Catastrophic Backtracking*.
* Laços de repetição síncronos de milhões de iterações calculando hashes sem delegação para workers.

Para tarefas de computação pesada, o Node.js disponibiliza o módulo nativo **`worker_threads`**, permitindo paralelismo real em múltiplas CPUs sem afetar o Event Loop da sua API web.

---

## 7. Boas Práticas Essenciais

1. **Prefira Promises a `process.nextTick`:** Use `process.nextTick` apenas em casos muito específicos onde você precisa garantir que um evento dispare antes de qualquer outra I/O.
2. **Entenda `setImmediate`:** Use `setImmediate` quando quiser deferir a execução de uma função para logo após o ciclo de I/O atual, sem travar o processador.
3. **Isole trabalho de CPU pesado:** Use `worker_threads` ou microserviços dedicados para tarefas de processamento de imagens, machine learning ou criptografia pesada.

---
*Parabéns por concluir o Módulo 05! Compreender a mecânica do Event Loop coloca você em um patamar de domínio técnico avançado em Node.js. Agora teste seus conhecimentos no Quiz do Módulo 05!*
