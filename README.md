<div align="center">
  <h1>🎲 Conector Random para n8n</h1>
  <h3><em>Gere inteiros verdadeiramente aleatórios via Random.org no seu n8n.</em></h3>
</div>

<p align="center">
  <strong>Node customizado do n8n que encapsula a API do <a href="https://www.random.org/integers/">Random.org</a>. Este repo inclui um ambiente Docker Compose com n8n + PostgreSQL já configurados para carregar o node automaticamente.</strong>
</p>

---

## Sumário

- [🤔 O que é](#-o-que-é)
- [⚡ Comece rápido](#-comece-rápido)
- [🔧 Requisitos](#-requisitos)
- [📦 Estrutura do projeto](#-estrutura-do-projeto)
- [🧭 Guia de uso](#-guia-de-uso)
- [🧑‍💻 Fluxo de desenvolvimento](#-fluxo-de-desenvolvimento)
- [🌐 Integração com Randomorg](#-integração-com-randomorg)
- [🔐 Segurança (dev vs prod)](#-segurança-dev-vs-prod)
- [🧰 Comandos úteis](#-comandos-úteis)
- [🪪 Variáveis de ambiente](#-variáveis-de-ambiente)
- [🔍 Troubleshooting](#-troubleshooting)
- [👥 Autor](#-autor)

## 🤔 O que é

Este projeto adiciona ao n8n um **node “Random”** com a operação *True Random Number Generator*, que chama a API pública do Random.org para retornar **um inteiro aleatório** dentro de um intervalo `[Min, Max]`.  
O repositório traz **Docker Compose** com n8n **1.85.4** + **PostgreSQL** e volumes mapeados para que o build do node seja **sincronizado automaticamente** para dentro do container.

## ⚡ Comece rápido

> [!IMPORTANT]
> Antes de iniciar, garanta que você está usando **Node.js 22 (LTS)** e **npm 10+** na máquina host.

```bash
# 1) Variáveis de ambiente
cp .env.example .env

# 2) Dependências
npm install

# 3) Build do node customizado (compila e sincroniza para n8n/.n8n/custom)
npm run build

# 4) Subir a stack (n8n + PostgreSQL)
sudo docker compose up -d

# 5) Acessar o painel (credenciais de dev)
# http://localhost:5678  (admin / admin)
```

Em seguida, no editor do n8n, busque por **Random** → operação **True Random Number Generator** → informe `Min` e `Max` → execute o node.

## 🔧 Requisitos

- **Node.js 22 (LTS)** + **TypeScript**
- **npm 10+**
- **Docker Engine 24+** e **Docker Compose v2**

## 📦 Estrutura do projeto

```
.
├─ docker-compose.yml            # Stack com n8n 1.85.4 + PostgreSQL e volumes
├─ .env.example                  # Template das variáveis de ambiente
├─ package.json                  # Config do workspace (scripts globais)
├─ scripts/
│  └─ postbuild.cjs              # Copia o build do node para n8n/.n8n/custom
├─ packages/
│  └─ random-node/
│     ├─ package.json            # Metadados do node (autor, deps, scripts)
│     ├─ tsconfig.json           # Compilador TypeScript (target ES2019)
│     ├─ src/nodes/Random/
│     │  ├─ Random.node.ts       # Operação "True Random Number Generator"
│     │  └─ random.svg           # Ícone do editor do n8n
│     ├─ dist/                   # Saída compilada (gitignore)
│     └─ test/                   # Futuros testes automatizados
└─ n8n/.n8n/
   └─ custom/                    # Nodes sincronizados para o container (pós-build)
```

## 🧭 Guia de uso

1. **Build**: `npm run build` (gera `packages/random-node/dist` e sincroniza em `n8n/.n8n/custom/random`).  
2. **Subir n8n**: `sudo docker compose up -d`  
3. **Acessar UI**: `http://localhost:5678` → login `admin/admin` *(apenas dev)*  
4. **Adicionar node**: no fluxo, procure **Random** → **True Random Number Generator** → defina `Min` e `Max` → **Executar**.  
5. **Parar stack**: `sudo docker compose down`

## 🧑‍💻 Fluxo de desenvolvimento

| Ação | Comando | Observações |
|---|---|---|
| Instalar deps | `npm install` | Workspace npm |
| Build do node | `npm run build` | Limpa, compila TS e sincroniza `.n8n/custom` |
| Reiniciar n8n | `docker compose restart n8n` | Recarrega o node no container |
| Lint/Tipos | `npm run lint` | Ajuste conforme suas regras |
| Testes | `npm test` | Hoje valida tipos; adicione Jest/Vitest conforme necessário |

## 🌐 Integração com Random.org

- A operação executa `GET https://www.random.org/integers/` com `num=1`, `min=<Min>`, `max=<Max>`, saída em **texto puro**.  
- O retorno é **validado** para garantir que o payload seja um **inteiro**; caso contrário, é lançado `NodeOperationError` no runtime do n8n.  
- O Compose define `NODE_FUNCTION_ALLOW_EXTERNAL=random.org` para permitir a chamada externa em ambientes reforçados do n8n.

## 🔐 Segurança (dev vs prod)

> [!WARNING]
> As credenciais de **desenvolvimento** (`admin/admin`) e a `N8N_ENCRYPTION_KEY` do `.env.example` **não** devem ser usadas em produção.

- Em **produção**, defina valores **fortes e exclusivos** para:
  - `N8N_BASIC_AUTH_USER`
  - `N8N_BASIC_AUTH_PASSWORD`
  - `N8N_ENCRYPTION_KEY`

## 🧰 Comandos úteis

```bash
# Logs do n8n
sudo docker compose logs -f n8n

# Resetar ambiente (remove volumes)
sudo docker compose down -v

# Limpar artefatos compilados
npm run clean --workspace @onfly/random-node
```

## 🪪 Variáveis de ambiente

> Consulte **.env.example** para a lista completa utilizada pelo `docker-compose.yml`.  
> Abaixo, as mais relevantes:

| Variável | Uso | Observação |
|---|---|---|
| `N8N_BASIC_AUTH_USER` | Autenticação básica | Produção |
| `N8N_BASIC_AUTH_PASSWORD` | Autenticação básica | Produção |
| `N8N_ENCRYPTION_KEY` | Criptografia interna do n8n | Produção |
| `NODE_FUNCTION_ALLOW_EXTERNAL` | Whitelist de domínios | Inclui `random.org` |

## 🔍 Troubleshooting

> [!TIP]
> O node “não aparece” após o build? Reinicie o serviço do n8n.

- **Node não carrega no editor**  
  Execute `docker compose restart n8n` após `npm run build`. Verifique se os artefatos estão em `n8n/.n8n/custom/random`.
- **Erro de rede ao chamar Random.org**  
  Confirme `NODE_FUNCTION_ALLOW_EXTERNAL=random.org` no ambiente do n8n e conectividade de saída do container.
- **Versão do Node incorreta**  
  Use **Node 22 (LTS)**. Se ocorrer `ELIFECYCLE`/erros de TS, remova `dist/` e refaça `npm ci && npm run build`.
- **Credenciais padrão ativas**  
  Mude `N8N_BASIC_AUTH_*` e `N8N_ENCRYPTION_KEY` antes de expor qualquer endpoint público.

---

## 👥 Autor

- **Vinícius Augusto Alves Santos Mello**