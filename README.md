# 🤖 Gari Bot

> O robô que limpa o chat e mantém a ordem!

![Gari Bot Banner](https://i.imgur.com/placeholder-gari-banner.png)

## 📋 Índice

- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Comandos](#-comandos)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Sistemas](#-sistemas)

---

## 🚀 Instalação

### Pré-requisitos
- Node.js **v18+**
- MongoDB (local ou Atlas)
- Bot criado no [Discord Developer Portal](https://discord.com/developers/applications)

### Passos

```bash
# 1. Instale as dependências
npm install

# 2. Copie o arquivo de ambiente
copy .env.example .env

# 3. Edite o .env com suas credenciais
notepad .env

# 4. Faça o deploy dos slash commands
npm run deploy

# 5. Inicie o bot
npm start
```

---

## ⚙️ Configuração

Edite o arquivo `.env`:

```env
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=id_do_bot
GUILD_ID=id_do_servidor_de_teste
MONGODB_URI=mongodb://localhost:27017/garibot
OWNER_ID=1435424556662915082
NODE_ENV=development
```

### Após iniciar o bot, use no Discord:

```
/configurar canais logs #canal-de-logs
/configurar canais boasvindas #boas-vindas
/configurar canais tickets [categoria]
/configurar sistemas toggle logs true
/configurar sistemas toggle boasvindas true
/configurar sistemas toggle tickets true
/configurar cargos staff @Staff
/ticket painel
```

---

## 🎮 Comandos

### 🔧 Utilidade
| Comando | Descrição |
|---------|-----------|
| `/ping` | Latência do bot |
| `/help` | Menu de ajuda interativo |
| `/avatar [usuário]` | Ver avatar |
| `/serverinfo` | Informações do servidor |
| `/userinfo [usuário]` | Informações de um usuário |
| `/painel` | Dashboard interno do bot |

### 🛡️ Moderação
| Comando | Descrição |
|---------|-----------|
| `/ban <usuário> [motivo] [dias]` | Banir usuário |
| `/kick <usuário> [motivo]` | Expulsar usuário |
| `/mute <usuário> <duração> [motivo]` | Silenciar |
| `/unmute <usuário>` | Remover silenciamento |
| `/warn <usuário> <motivo>` | Advertir usuário |
| `/warnings ver <usuário>` | Ver advertências |
| `/warnings limpar <usuário>` | Limpar advertências |
| `/warnings remover <usuário> <nº>` | Remover aviso |
| `/purge <quantidade> [usuário]` | Deletar mensagens |

### ⭐ Níveis
| Comando | Descrição |
|---------|-----------|
| `/rank [usuário]` | Ver nível e XP |
| `/leaderboard` | Top 10 usuários |

### 🎟️ Tickets
| Comando | Descrição |
|---------|-----------|
| `/ticket painel` | Envia painel de tickets |

### 🎮 Diversão
| Comando | Descrição |
|---------|-----------|
| `/meme` | Meme aleatório |
| `/diversao coinflip` | Cara ou coroa |
| `/diversao dado [lados]` | Rolar dado |
| `/diversao piada` | Piada aleatória |
| `/diversao fato` | Fato curioso |
| `/diversao 8ball <pergunta>` | Bola mágica |

### ⚙️ Configuração (Somente Dono)
| Comando | Descrição |
|---------|-----------|
| `/configurar canais logs` | Canal de logs |
| `/configurar canais boasvindas` | Canal de boas-vindas |
| `/configurar canais saida` | Canal de saída |
| `/configurar canais tickets` | Categoria de tickets |
| `/configurar canais levelup` | Canal de level up |
| `/configurar sistemas toggle` | Ativar/desativar sistema |
| `/configurar cargos autorole` | Cargo automático |
| `/configurar cargos staff` | Cargo de staff |
| `/configurar mensagens boasvindas` | Mensagem personalizada |
| `/configurar mensagens saida` | Mensagem de saída |
| `/configurar autoresposta adicionar` | Nova auto-resposta |
| `/configurar autoresposta remover` | Remover auto-resposta |
| `/configurar autoresposta listar` | Listar auto-respostas |

---

## 📁 Estrutura do Projeto

```
gari-bot/
├── src/
│   ├── index.js                 # Entrada principal
│   ├── deploy-commands.js       # Deploy dos slash commands
│   │
│   ├── commands/
│   │   ├── config/
│   │   │   └── configurar.js    # Configuração do bot (dono)
│   │   ├── fun/
│   │   │   ├── meme.js          # Memes do Reddit
│   │   │   └── diversao.js      # Coinflip, dado, piadas
│   │   ├── levels/
│   │   │   ├── rank.js          # Ver nível/XP
│   │   │   └── leaderboard.js   # Ranking do servidor
│   │   ├── moderation/
│   │   │   ├── ban.js
│   │   │   ├── kick.js
│   │   │   ├── mute.js
│   │   │   ├── unmute.js
│   │   │   ├── warn.js
│   │   │   ├── warnings.js
│   │   │   └── purge.js
│   │   ├── tickets/
│   │   │   └── ticket.js
│   │   └── utility/
│   │       ├── ping.js
│   │       ├── help.js
│   │       ├── avatar.js
│   │       ├── serverinfo.js
│   │       ├── userinfo.js
│   │       └── painel.js
│   │
│   ├── events/
│   │   ├── ready.js             # Bot online
│   │   ├── interactionCreate.js # Slash commands e botões
│   │   ├── messageCreate.js     # XP, anti-spam, auto-respostas
│   │   ├── messageDelete.js     # Log de mensagens deletadas
│   │   ├── guildMemberAdd.js    # Boas-vindas + auto-role
│   │   └── guildMemberRemove.js # Mensagem de saída
│   │
│   ├── systems/
│   │   ├── antiSpamSystem.js    # Anti-spam, flood, link
│   │   ├── levelSystem.js       # Sistema de XP/níveis
│   │   └── ticketSystem.js      # Sistema de tickets
│   │
│   ├── database/
│   │   ├── connection.js        # Conexão MongoDB
│   │   └── models/
│   │       ├── Guild.js         # Configurações do servidor
│   │       ├── User.js          # Dados do usuário (XP, warns)
│   │       └── Ticket.js        # Tickets de suporte
│   │
│   └── utils/
│       ├── embeds.js            # Helpers de embed (tema verde neon)
│       └── helpers.js           # Funções auxiliares gerais
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔧 Sistemas

### Anti-Spam
Detecta mensagens repetidas em curto intervalo. Configure em `/configurar sistemas toggle antiSpam true`.

### Anti-Flood
Detecta muitas mensagens diferentes em pouco tempo.

### Anti-Link
Bloqueia links não autorizados (exceto links do Discord oficial).

### Sistema de Níveis
- Ganha XP a cada mensagem (cooldown de 1 minuto)
- Notificação automática de level up
- Ranking por servidor

### Sistema de Tickets
1. Staff usa `/ticket painel` para enviar o painel
2. Usuário clica em "Abrir Ticket"
3. Canal privado criado automaticamente
4. Staff pode assumir e fechar com transcript

### Variáveis de Mensagens
Use nas mensagens de boas-vindas/saída:
- `{user}` - Menção do usuário
- `{username}` - Nome do usuário
- `{count}` - Número de membros
- `{server}` - Nome do servidor
- `{id}` - ID do usuário

---

## 🎨 Tema Visual

- **Cor principal:** `#00FF41` (Verde Neon)
- **Cor de erro:** `#FF0000` (Vermelho)
- **Cor de aviso:** `#FFFF00` (Amarelo)
- **Estilo:** Tecnológico, estética cyberpunk/terminal

---

*Gari Bot v1.0.0 — Desenvolvido com ❤️ e Node.js*
