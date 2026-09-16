#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { select } from '@inquirer/prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TUTORIALS_DIR = path.join(__dirname, '../src/data/tutorials');
const QUIZZES_DIR = path.join(__dirname, '../src/data/quizzes');

/**
 * Obtém a lista ordenada de módulos disponíveis extraindo títulos reais
 */
function getAvailableModules(directory, extension) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory)
    .filter(file => file.endsWith(extension))
    .sort((a, b) => {
      const numA = parseInt(a.split('-')[0], 10);
      const numB = parseInt(b.split('-')[0], 10);
      return numA - numB;
    })
    .map(file => {
      const id = file.replace(extension, '');
      const num = id.split('-')[0].padStart(2, '0');
      let title = '';

      if (extension === '.md') {
        try {
          const content = fs.readFileSync(path.join(directory, file), 'utf-8');
          const firstLine = content.split('\n')[0].replace(/^#\s*/, '').trim();
          title = firstLine || `Módulo ${num}`;
        } catch {
          title = `Módulo ${num}`;
        }
      } else if (extension === '.json') {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf-8'));
          title = content.title || `Quiz ${num}`;
        } catch {
          title = `Quiz ${num}`;
        }
      }

      return {
        id,
        number: parseInt(num, 10),
        filename: file,
        displayName: title,
      };
    });
}

const program = new Command();

program
  .name('tq-node')
  .description('Ferramenta CLI para ensinar o básico sobre Node.js e NPM através de tutoriais e quizzes interativos')
  .version('1.0.0');

program
  .command('list')
  .alias('ls')
  .description('Lista todos os tutoriais e módulos disponíveis no tq-node')
  .action(() => {
    const modules = getAvailableModules(TUTORIALS_DIR, '.md');

    if (modules.length === 0) {
      console.log(chalk.red('❌ Nenhum tutorial encontrado!'));
      return;
    }

    console.log(chalk.cyan('\n=================================================='));
    console.log(chalk.green.bold(' 📚 TQ-NODE: TUTORIAIS DISPONÍVEIS'));
    console.log(chalk.cyan('==================================================\n'));

    modules.forEach((mod) => {
      const numBadge = chalk.yellow.bold(`[${String(mod.number).padStart(2, '0')}]`);
      console.log(` ${numBadge} ${chalk.white.bold(mod.displayName)}`);
      console.log(`      ${chalk.gray('Comando:')} ${chalk.cyan(`tq-node tutorial ${mod.number}`)}  ${chalk.gray('|')}  ${chalk.cyan(`tq-node quiz ${mod.number}`)}\n`);
    });

    console.log(chalk.cyan('=================================================='));
    console.log(chalk.gray('💡 Para ler um tutorial: ') + chalk.white('tq-node tutorial <número>'));
    console.log(chalk.gray('💡 Para responder ao quiz: ') + chalk.white('tq-node quiz <número>'));
    console.log(chalk.cyan('==================================================\n'));
  });

program
  .command('tutorial [modulo]')
  .description('Exibe um tutorial interativo em Markdown (informe o número/nome ou selecione no menu)')
  .action(async (modulo) => {
    const modules = getAvailableModules(TUTORIALS_DIR, '.md');
    
    if (modules.length === 0) {
      console.log(chalk.red('❌ Nenhum tutorial encontrado na pasta de tutoriais!'));
      return;
    }

    let targetModule = null;

    if (modulo) {
      targetModule = modules.find(m => 
        String(m.number) === String(modulo) ||
        m.id === modulo || 
        m.id.startsWith(`${modulo}-`) ||
        m.filename === modulo ||
        m.filename === `${modulo}.md`
      );

      if (!targetModule) {
        console.log(chalk.red(`❌ Módulo "${modulo}" não foi encontrado!`));
        console.log(chalk.yellow('\nEscolha um dos módulos abaixo:'));
      }
    }

    if (!targetModule) {
      const selectedId = await select({
        message: '📚 Selecione o módulo que deseja estudar:',
        choices: modules.map(m => ({
          name: m.displayName,
          value: m.id
        }))
      });
      targetModule = modules.find(m => m.id === selectedId);
    }

    const mdPath = path.join(TUTORIALS_DIR, targetModule.filename);
    const content = fs.readFileSync(mdPath, 'utf-8');

    console.log(chalk.cyan('\n=================================================='));
    console.log(chalk.green.bold(` 📚 TQ-NODE: ${targetModule.displayName.toUpperCase()}`));
    console.log(chalk.cyan('==================================================\n'));
    console.log(content);
    console.log(chalk.cyan('==================================================\n'));
  });

program
  .command('quiz [modulo]')
  .description('Inicia o quiz interativo de perguntas e respostas sobre Node.js e NPM')
  .action(async (modulo) => {
    const modules = getAvailableModules(QUIZZES_DIR, '.json');

    if (modules.length === 0) {
      console.log(chalk.red('❌ Nenhum quiz encontrado na pasta de quizzes!'));
      return;
    }

    let targetModule = null;

    if (modulo) {
      targetModule = modules.find(m => 
        String(m.number) === String(modulo) ||
        m.id === modulo || 
        m.id.startsWith(`${modulo}-`) ||
        m.filename === modulo ||
        m.filename === `${modulo}.json`
      );

      if (!targetModule) {
        console.log(chalk.red(`❌ Quiz do módulo "${modulo}" não encontrado!`));
        console.log(chalk.yellow('\nSelecione um dos quizzes disponíveis:'));
      }
    }

    if (!targetModule) {
      const selectedId = await select({
        message: '🎯 Selecione o quiz que deseja responder:',
        choices: modules.map(m => ({
          name: m.displayName,
          value: m.id
        }))
      });
      targetModule = modules.find(m => m.id === selectedId);
    }

    const jsonPath = path.join(QUIZZES_DIR, targetModule.filename);
    const quizData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log(chalk.cyan('\n=================================================='));
    console.log(chalk.yellow.bold(` 🎯 ${quizData.title}`));
    console.log(chalk.cyan('==================================================\n'));

    let score = 0;

    for (const q of quizData.questions) {
      const answer = await select({
        message: q.question,
        choices: q.choices,
      });

      if (answer === q.correct) {
        score++;
        console.log(chalk.green('✅ Resposta Correta!\n'));
      } else {
        console.log(chalk.red('❌ Resposta incorreta.'));
        console.log(chalk.gray(`💡 Explicação: ${q.explanation}\n`));
      }
    }

    console.log(chalk.cyan('=================================================='));
    const percentage = Math.round((score / quizData.questions.length) * 100);
    const resultColor = percentage >= 70 ? chalk.green.bold : chalk.yellow.bold;
    console.log(resultColor(`🏆 Quiz finalizado! Sua pontuação: ${score} / ${quizData.questions.length} (${percentage}%)`));
    console.log(chalk.cyan('==================================================\n'));
  });

program.parse(process.argv);
