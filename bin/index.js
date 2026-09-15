#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { select } from '@inquirer/prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('tq-node')
  .description('Ferramenta CLI para ensinar o básico sobre Node.js e NPM através de tutoriais e quizzes')
  .version('1.0.0');

program
  .command('tutorial')
  .description('Exibe o tutorial de instalação do Node.js e NPM')
  .action(() => {
    const mdPath = path.join(__dirname, '../src/data/tutorials/instalacao.md');
    if (!fs.existsSync(mdPath)) {
      console.log(chalk.red('❌ Arquivo de tutorial não encontrado!'));
      return;
    }
    const content = fs.readFileSync(mdPath, 'utf-8');
    console.log(chalk.cyan('\n========================================'));
    console.log(chalk.green.bold(' 📚 TQ-NODE: TUTORIAL DE INSTALAÇÃO'));
    console.log(chalk.cyan('========================================\n'));
    console.log(content);
    console.log(chalk.cyan('========================================\n'));
  });

program
  .command('quiz')
  .description('Inicia o quiz interativo sobre Node.js e NPM')
  .action(async () => {
    const jsonPath = path.join(__dirname, '../src/data/quizzes/instalacao.json');
    if (!fs.existsSync(jsonPath)) {
      console.log(chalk.red('❌ Arquivo de quiz não encontrado!'));
      return;
    }
    
    const quizData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    console.log(chalk.cyan('\n========================================'));
    console.log(chalk.yellow.bold(` 🎯 ${quizData.title}`));
    console.log(chalk.cyan('========================================\n'));

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
        console.log(chalk.gray(`Explicação: ${q.explanation}\n`));
      }
    }

    console.log(chalk.cyan('========================================'));
    console.log(chalk.bold(`🏆 Quiz finalizado! Sua pontuação: ${score} / ${quizData.questions.length}`));
    console.log(chalk.cyan('========================================\n'));
  });

program.parse(process.argv);
