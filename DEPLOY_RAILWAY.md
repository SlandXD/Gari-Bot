# 🚂 Deploy do Gari Bot no Railway

## Pré-requisitos

- Conta no [railway.com](https://railway.com)
- Conta no [GitHub](https://github.com) (necessário para o deploy)
- Bot criado no [Discord Developer Portal](https://discord.com/developers/applications)
- ✅ MongoDB Atlas — cluster já criado

---

## Parte 1 — Configurar o MongoDB Atlas

> Você já tem o cluster criado. Só falta liberar o acesso e confirmar a senha.

### 1.1 — Liberar acesso de qualquer IP (obrigatório para o Railway)

1. Acesse [cloud.mongodb.com](https://cloud.mongodb.com)
2. No menu lateral, clique em **Network Access**
3. Clique em **Add IP Address**
4. Selecione **Allow Access from Anywhere** → **0.0.0.0/0**
5. Clique em **Confirm**

### 1.2 — Pegar/confirmar a senha do usuário

1. No menu lateral, clique em **Database Access**
2. Você verá o usuário `gabrielsouzagab998_db_user`
3. Clique em **Edit** → **Edit Password** → copie ou gere uma nova senha

### 1.3 — Sua URI de conexão pronta

Substitua `SUA_SENHA` pela senha do passo acima:

```
mongodb+srv://gabrielsouzagab998_db_user:SUA_SENHA@cluster0.uf9ufgi.mongodb.net/garibot?retryWrites=true&w=majority&appName=Cluster0
```

> ⚠️ O `/garibot` antes do `?` define o nome do banco — não remova.

---

## Parte 2 — Subir o projeto no GitHub

Abra o terminal **dentro da pasta "Gari Bot"** e rode:

```bash
git init
git add .
git commit -m "feat: Gari Bot v1.0"
```

Depois:
1. Acesse [github.com/new](https://github.com/new)
2. Crie um repositório **privado** com o nome `gari-bot`
3. Copie os comandos que aparecem em "push an existing repository" e execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/gari-bot.git
git push -u origin main
```

> ⚠️ Repositório **PRIVADO** para ninguém ver seu token.

---

## Parte 3 — Deploy no Railway

1. Acesse [railway.com](https://railway.com) → faça login com GitHub

2. Clique em **New Project** → **Deploy from GitHub repo**

3. Selecione o repositório `gari-bot` → clique em **Deploy Now**

4. O Railway detecta Node.js automaticamente e inicia o build

5. Clique no serviço criado → aba **Variables** → clique em **Raw Editor** e cole:

```
DISCORD_TOKEN=SEU_TOKEN_AQUI
CLIENT_ID=SEU_CLIENT_ID_AQUI
MONGODB_URI=mongodb+srv://gabrielsouzagab998_db_user:SUA_SENHA@cluster0.uf9ufgi.mongodb.net/garibot?retryWrites=true&w=majority&appName=Cluster0
OWNER_ID=1435424556662915082
NODE_ENV=production
```

6. Clique em **Update Variables** — o Railway reinicia automaticamente

7. Vá em **Deployments** e veja os logs. Deve aparecer:
   ```
   [DATABASE] ✅ Conectado ao MongoDB com sucesso!
   [COMANDOS] XX comandos carregados com sucesso.
   [BOT] ✅ GariBot#XXXX está online!
   ```

---

## Parte 4 — Registrar os Slash Commands

Os comandos `/ban`, `/help`, etc. precisam ser registrados no Discord **uma única vez**.

### Opção A — Pelo seu PC (mais simples)

Crie um arquivo `.env` na pasta do projeto com:
```env
DISCORD_TOKEN=SEU_TOKEN_AQUI
CLIENT_ID=SEU_CLIENT_ID_AQUI
GUILD_ID=ID_DO_SEU_SERVIDOR
MONGODB_URI=mongodb+srv://gabrielsouzagab998_db_user:SUA_SENHA@cluster0.uf9ufgi.mongodb.net/garibot?retryWrites=true&w=majority&appName=Cluster0
OWNER_ID=1435424556662915082
NODE_ENV=development
```

Depois rode:
```bash
npm run deploy
```

Saída esperada:
```
[+] Comando coletado: /ping
[+] Comando coletado: /help
...
[DEPLOY] ✅ Comandos deployados no servidor de teste! (instantâneo)
```

### Opção B — Pelo Railway CLI

```bash
# Instalar o CLI
npm install -g @railway/cli

# Login e vincular ao projeto
railway login
railway link

# Rodar o deploy de comandos
railway run node src/deploy-commands.js
```

---

## Parte 5 — Verificar no Discord

No seu servidor, teste:
- `/ping` → responde com latência ✅
- `/help` → abre o menu interativo ✅
- `/painel` → mostra o dashboard ✅

Depois configure o bot:
```
/configurar canais logs #canal-de-logs
/configurar canais boasvindas #bem-vindo
/configurar sistemas toggle logs true
/configurar sistemas toggle welcome true
```

---

## ⚠️ Variáveis no Railway (resumo)

| Variável | Valor |
|----------|-------|
| `DISCORD_TOKEN` | Token do bot (Developer Portal) |
| `CLIENT_ID` | ID do aplicativo (Developer Portal) |
| `MONGODB_URI` | URI do Atlas com sua senha |
| `OWNER_ID` | `1435424556662915082` |
| `NODE_ENV` | `production` |

> Não adicione `GUILD_ID` em produção — assim os comandos ficam globais.

---

## 💡 Dicas Railway

- **Logs ao vivo**: Clique no serviço → aba **Observability** → **Logs**
- **Redeploy**: Aba **Deployments** → três pontinhos → **Redeploy**
- **Plano gratuito**: O Railway dá ~$5 de crédito/mês grátis, suficiente para um bot leve
- **Bot 24/7**: No plano **Hobby** ($5/mês) o serviço nunca dorme

---

## 🆘 Erros comuns

| Erro nos logs | Causa | Solução |
|---------------|-------|---------|
| `An invalid token was provided` | Token errado | Reconfira o `DISCORD_TOKEN` |
| `MongoServerSelectionError` | IP bloqueado no Atlas | Adicione `0.0.0.0/0` no Network Access |
| `Authentication failed` | Senha errada na URI | Reconfira a senha do usuário no Atlas |
| Comandos não aparecem | Não foram registrados | Rode `npm run deploy` |
| Bot offline | Erro no código | Veja os logs na aba Observability |
