# Módulo 09: Criação de Ferramentas CLI Avançadas no Node.js

Bem-vindo ao nono módulo do **tq-node**! Se você chegou até aqui, já percebeu que está utilizando exatamente uma ferramenta de linha de comando (**CLI - Command Line Interface**) desenvolvida em Node.js para aprender esses conceitos.

O ecossistema Node.js é hoje a plataforma mais popular do mundo para a criação de CLIs modernas, alimentando ferramentas consagradas da indústria como `npm`, `vite`, `create-react-app`, `prisma` e a própria CLI `tq-node`. Neste módulo, vamos aprender como projetar, estruturar, estilizar e distribuir ferramentas de terminal profissionais e elegantes.

---

## 1. A Anatomia de uma CLI em Node.js

Para transformar um script JavaScript comum em um utilitário executável diretamente pelo terminal do sistema operacional (ex: apenas digitando `tq-node`), precisamos de três ingredientes fundamentais:

### A. A Linha Shebang (`#!/usr/bin/env node`)
Todo arquivo de entrada de uma CLI deve conter como sua **primeiríssima linha** a declaração do *Shebang*:
```javascript
#!/usr/bin/env node
```
Essa linha informa aos sistemas operacionais baseados em Unix (Linux e macOS) e aos emuladores de terminal do Windows que aquele script deve ser interpretado e executado pelo executável do `node` disponível nas variáveis de ambiente da máquina.

### B. O Mapeamento do Campo `"bin"` no `package.json`
No manifesto do seu projeto, você deve registrar o comando executável vinculando-o ao arquivo de entrada:
```json
{
  "name": "minha-ferramenta",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "minha-ferramenta": "./bin/index.js"
  }
}
```

### C. O Comando `npm link`
Durante o desenvolvimento local, você não precisa publicar seu pacote no registro oficial do NPM para testá-lo como comando global. Na pasta raiz do seu projeto, basta executar:
```bash
npm link
```
O NPM criará um link simbólico global no seu sistema operacional, permitindo que você digite `minha-ferramenta` em qualquer pasta do seu terminal para testar sua CLI instantaneamente!

---

## 2. Processando Argumentos com Commander.js

Tentar interpretar argumentos de linha de comando manualmente inspecionando o array bruto `process.argv` torna-se rapidamente inviável à medida que sua ferramenta cresce.

O **Commander.js** é o padrão da indústria para parsing de comandos, flags e argumentos no Node.js:

```javascript
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('conversor')
  .description('Utilitário para conversão de imagens e arquivos')
  .version('1.0.0');

// Definindo um subcomando com argumento obrigatório <arquivo> e flag opcional -f
program
  .command('otimizar <arquivo>')
  .description('Otimiza uma imagem para a web')
  .option('-f, --formato <tipo>', 'Formato de saída desejado', 'webp')
  .option('-q, --qualidade <numero>', 'Qualidade de 1 a 100', '80')
  .action((arquivo, opcoes) => {
    console.log(`Processando arquivo: ${arquivo}`);
    console.log(`Formato selecionado: ${opcoes.formato}`);
    console.log(`Qualidade configurada: ${opcoes.qualidade}%`);
  });

// Processa os argumentos passados pelo usuário no terminal
program.parse(process.argv);
```

### Benefício Gratuito do Commander:
Ele cria automaticamente telas completas de ajuda (`--help`) e versão (`--version` / `-V`) para o usuário:
```bash
conversor otimizar --help
```

---

## 3. Melhorando a Experiência do Usuário (Terminal UX)

Uma CLI profissional não entrega apenas saídas em texto preto e branco monótono; ela comunica status com clareza, cores semânticas e interfaces interativas.

### A. Estilização Visual com `chalk`
O pacote `chalk` adiciona cores, negrito e destaques visuais ricos:
```javascript
import chalk from 'chalk';

console.log(chalk.green.bold('✔ Operação concluída com sucesso!'));
console.log(chalk.yellow('⚠ Aviso: O arquivo de configuração não foi encontrado.'));
console.log(chalk.red.underline('✖ Erro crítico de conexão.'));
```

### B. Prompts Interativos com `@inquirer/prompts`
Em vez de forçar o usuário a memorizar dezenas de flags, ofereça formulários interativos intuitivos com menus de seleção (`select`), confirmações sim/não (`confirm`) e campos de texto (`input`):

```javascript
import { select, confirm } from '@inquirer/prompts';

const moduloEscolhido = await select({
  message: 'Qual módulo do curso você deseja estudar agora?',
  choices: [
    { name: '1. Introdução e Instalação', value: '1' },
    { name: '2. O Módulo Path', value: '2' },
    { name: '3. Manipulação de Arquivos', value: '3' }
  ]
});

const iniciarQuiz = await confirm({
  message: 'Deseja iniciar o quiz interativo deste módulo imediatamente?',
  default: true
});
```

---

## 4. Códigos de Saída do Processo (*Exit Codes*)

Quando um script de terminal finaliza sua execução, ele retorna um número inteiro chamado **Exit Code** para o sistema operacional:
* **`process.exit(0)`**: Código **0** significa que o comando finalizou com **sucesso absoluto**.
* **`process.exit(1)`** (ou qualquer número diferente de zero): Indica que ocorreu uma **falha ou erro**.

### Por que os Exit Codes são cruciais?
Porque outros scripts em bash, pipelines de CI/CD (GitHub Actions) ou comandos encadeados com `&&` (ex: `tq-node quiz && deploy.sh`) dependem do código de saída para saber se devem continuar ou interromper a automação!

---

## 5. Tratamento Robusto de Erros na Linha de Comando

Se a sua CLI estourar um erro não tratado com uma pilha feia de *stack trace* na cara do usuário, a experiência será frustrante. Trate falhas de forma amigável:

```javascript
process.on('uncaughtException', (erro) => {
  console.error(chalk.red.bold('\n💥 Ocorreu um erro inesperado:'));
  console.error(chalk.gray(erro.message));
  process.exit(1);
});

// Captura se o usuário cancelar o prompt com Ctrl+C
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Operação cancelada pelo usuário. Até logo!'));
  process.exit(0);
});
```

---

## 6. Boas Práticas para Arquitetura de CLIs

1. **Separe a lógica de negócio da interface de terminal:** Mantenha os comandos da CLI em pastas dedicadas (`bin/` ou `src/commands/`) e a lógica de processamento em módulos de serviços (`src/services/`).
2. **Sempre respeite as saídas semânticas de erro:** Mensagens de erro devem ser impressas preferencialmente em `process.stderr` (ou `console.error`), reservando `process.stdout` (`console.log`) para saídas consumíveis por outros programas.
3. **Ofereça flags para automação silenciosa (`--silent` ou `--json`):** Permite que outros programas ou robôs utilizem sua CLI sem poluição visual.

---
*Parabéns por concluir o Módulo 09! Agora você compreende a engenharia completa por trás da criação de CLIs elegantes e poderosas no Node.js. Teste seus conhecimentos no Quiz do Módulo 09!*
