# Módulo 01: Instalação do Node.js e NPM

Bem-vindo ao **tq-node**! Este guia introdutório vai te ensinar o que são o Node.js e o NPM, e como instalá-los no seu computador.

---

## 1. O que é o Node.js?
O **Node.js** é um ambiente de execução (runtime) JavaScript de código aberto construído sobre o motor V8 do Google Chrome. 
* Ele permite que você execute código JavaScript **fora do navegador** (no seu computador, servidor, etc.).
* É ideal para criar servidores web, ferramentas de linha de comando (como esta!) e aplicações escaláveis.

## 2. O que é o NPM?
O **NPM** (Node Package Manager) é o gerenciador de pacotes padrão do Node.js.
* Ele é instalado automaticamente junto com o Node.js.
* Permite baixar, instalar e gerenciar bibliotecas e ferramentas de código aberto criadas por outros desenvolvedores em todo o mundo.

---

## 3. Como Instalar o Node.js e o NPM

### No Linux (Ubuntu / Debian / Pop!_OS)
Você pode instalar a versão LTS recomendada usando o gerenciador de pacotes ou o `nvm` (Node Version Manager). Recomendamos o `nvm` para evitar problemas de permissão:

```bash
# Instalando via Apt (rápido)
sudo apt update
sudo apt install nodejs npm

# Verificando a instalação
node -v
npm -v
```

### No Windows / macOS
1. Acesse o site oficial: [https://nodejs.org/](https://nodejs.org/)
2. Baixe a versão **LTS** (Long Term Support), que é a mais estável e recomendada para a maioria dos usuários.
3. Execute o instalador baixado e siga os passos na tela (marque a opção para instalar as ferramentas necessárias, se houver).
4. Abra o seu terminal (Prompt de Comando, PowerShell ou Terminal) e verifique a instalação executando:
   ```bash
   node -v
   npm -v
   ```

---
*Parabéns por concluir este tutorial! Agora teste seus conhecimentos executando o quiz correspondente.*
