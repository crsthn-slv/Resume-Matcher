# 🚀 Guia de Configuração Fácil: Resume Matcher (macOS Nativo)

Este guia foi criado para uma instalação rápida e sem Docker no Mac. Ele está dividido em **estágios** para que você possa copiar e enviar para sua assistente de IA realizar uma etapa de cada vez.

---

## Estágio 0: Instalando a Fundação (Iniciando do Zero)

**Instruções para a IA:**
"Assuma que meu Mac está totalmente limpo. Primeiro, verifique se eu tenho o **Homebrew** instalado. Se não tiver, me guie na instalação oficial. Depois de instalado, certifique-se de que ele foi adicionado ao meu PATH (especialmente se for um Mac M1/M2/M3)."

**Comandos de referência (Instalação do Brew):**
```bash
# Caso não tenha o Brew, o comando oficial é:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# IMPORTANTE: Após instalar, a IA deve rodar os comandos de "Next steps" que o instalador mostrar para adicionar o brew ao PATH no arquivo .zprofile.
```

---

## Estágio 1: Preparação do Ambiente (Runtime & Tools)

**Instruções para a IA:**
"Agora que o Homebrew está pronto, instale as ferramentas necessárias para rodar o projeto:
1. Python 3.13 (versão específica para este projeto).
2. Node.js 22 (Long Term Support).
3. Gerenciador 'uv' (ferramenta moderna para gerenciar o Python do projeto).
4. Git (para gerenciar o código)."

**Comandos de referência para a IA:**
```bash
brew update
brew install python@3.13 node@22 uv git
```

---

## Estágio 1.5: Clonando o Projeto (Obtendo o Código)

**Instruções para a IA:**
"Agora que o Git está instalado, preciso clonar o repositório para minha máquina. Use o link do GitHub que vou fornecer. Depois de clonar, entre na pasta do projeto."

**Comandos de referência para a IA:**
```bash
# TROQUE O LINK ABAIXO PELO SEU LINK DO GITHUB
git clone https://github.com/crsthn-slv/Resume-Matcher.git
cd Resume-Matcher
```

---

## Estágio 2: Setup do Backend e Dependências

**Instruções para a IA:**
"Configure o motor do projeto:
1. Navegue até a pasta `apps/backend`.
2. Crie um arquivo `.env` a partir do `.env.example`.
3. Use o comando `uv sync` para criar o ambiente virtual e instalar todas as bibliotecas de IA de forma isolada."

**Comandos de referência para a IA:**
```bash
cd apps/backend
cp .env.example .env
uv sync
```

---

## Estágio 3: Configuração da IA (O Provedor)

**Instruções para a IA:**
"Ajude-me a definir qual IA o projeto vai usar. Abra o arquivo `apps/backend/.env` e configure o `LLM_PROVIDER`. 
- Se eu quiser usar **OpenAI**, peça minha chave de API (`sk-...`).
- Se eu quiser usar **Ollama** (IA local e gratuita), valide se o Ollama está instalado e rodando com o modelo `gemma3:4b` ou similar."

---

## Estágio 4: Setup do Frontend (Interface Visual)

**Instruções para a IA:**
"Vamos montar a interface visual:
1. Navegue até `apps/frontend`.
2. Execute `npm install` para baixar os componentes.
3. Inicie o servidor de desenvolvimento."

**Comandos de referência para a IA:**
```bash
cd apps/frontend
npm install
npm run dev
```

---

## Estágio 5: Verificação de Inicialização

**Instruções para a IA:**
"Verifique se tudo está funcionando corretamente:
- O Backend deve estar rodando em: `http://localhost:8000`
- O Frontend deve estar rodando em: `http://localhost:3000`
Tente acessar o dashboard e confirme se a conexão com o backend está ativa (visível no console)."

---

### Dicas Extras para macOS:
- **Python do Sistema**: Nunca tente instalar bibliotecas no Python nativo do Mac. Use sempre o `uv` conforme instruído no Estágio 2.
- **Portas Ocupadas**: Se a porta 3000 estiver em uso, a IA pode tentar iniciar o frontend em outra porta (como 3001). Preste atenção no log do terminal.
- **Ollama no Mac**: Se optar por IA local, baixe o app em [ollama.com](https://ollama.com) primeiro.
