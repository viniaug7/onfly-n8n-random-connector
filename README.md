# Conector Random para n8n

Conector personalizado do n8n que encapsula a API do [Random.org](https://www.random.org/integers/) para gerar números inteiros verdadeiramente aleatórios. O repositório inclui um ambiente Docker Compose com n8n e PostgreSQL já configurados para carregar o node automaticamente.

## Requisitos

- Node.js + TypeScript na versão 22 (LTS)
- npm 10+
- Docker Engine 24+ e Docker Compose v2

## Estrutura do projeto

```
.
├─ docker-compose.yml            # Stack com n8n 1.85.4 + PostgreSQL e volumes
├─ .env.example                  # Template das variáveis de ambiente
├─ package.json                  # Configuração do workspace (autor, scripts globais)
├─ scripts/
│  └─ postbuild.cjs              # Copia o build do node para n8n/.n8n/custom
├─ packages/
│  └─ random-node/
│     ├─ package.json            # Metadados do node (autor, deps, scripts)
│     ├─ tsconfig.json           # Compilador TypeScript (target ES2019)
│     ├─ src/nodes/Random/
│     │  ├─ Random.node.ts       # Implementação da operação "True Random Number Generator"
│     │  └─ random.svg           # Ícone utilizado no editor do n8n
│     ├─ dist/                   # Saída compilada (gerada pelo build, ignorada no git)
│     └─ test/                   # Pasta reservada para futuros testes automatizados
└─ n8n/.n8n/
   └─ custom/                    # Nodes sincronizados para dentro do container (pós-build)
```

## Passo a passo

1. Copie o arquivo de variáveis padrão:

   ```bash
   cp .env.example .env
   ```

2. Instale as dependências (workspace npm):

   ```bash
   npm install
   ```

3. Compile o node customizado e sincronize com `.n8n/custom`:

   ```bash
   npm run build
   ```

O script de build compila o pacote TypeScript (`packages/random-node`) e publica os artefatos em `n8n/.n8n/custom/random`, diretório que é montado no contêiner do n8n.

## Executar o n8n localmente

1. Inicialize a stack:

   ```bash
   sudo docker compose up -d
   ```

2. Acesse o painel em [http://localhost:5678](http://localhost:5678) (credenciais padrão `admin/admin`).

**Segurança (local vs. prod)**

* As credenciais padrão `admin/admin` e a `N8N_ENCRYPTION_KEY` fornecidas em `.env.example` servem apenas para desenvolvimento local.
* Em produção, redefina `N8N_BASIC_AUTH_USER`, `N8N_BASIC_AUTH_PASSWORD` e `N8N_ENCRYPTION_KEY` com valores fortes e exclusivos.

3. No editor de workflows, busque pelo node **Random** e escolha a operação *True Random Number Generator*. Informe os inteiros `Min` e `Max` para gerar um número via Random.org.

4. Para encerrar os serviços:

   ```bash
   sudo docker compose down
   ```

## Fluxo de desenvolvimento

- Recompile após qualquer alteração no código do node:

  ```bash
  npm run build
  ```
  O comando limpa artefatos anteriores, roda o TypeScript e atualiza `.n8n/custom`.

- Reinicie o contêiner do n8n para recarregar o node:

   ```bash
   docker compose restart n8n
   ```

- Verifique tipos/lint:

  ```bash
  npm run lint
  ```

- O comando abaixo executa testes automatizados (atualmente apenas a checagem de tipos) em `packages/random-node/test`.

  ```bash
  npm test
  ```

## Integração com Random.org

- A operação realiza `GET https://www.random.org/integers/` com `num=1`, repassando os limites `Min` e `Max` e solicitando retorno em texto puro.
- O resultado é validado para garantir que o payload seja um inteiro; respostas inválidas disparam `NodeOperationError` durante a execução do workflow.
- A configuração Docker define `NODE_FUNCTION_ALLOW_EXTERNAL=random.org` para permitir a chamada externa em ambientes reforçados do n8n.

## Comandos úteis

- Acompanhar logs do n8n: `sudo docker compose logs -f n8n`
- Resetar o ambiente (remove volumes): `sudo docker compose down -v`
- Limpar artefatos compilados: `npm run clean --workspace @onfly/random-node`

## Próximos passos sugeridos

- Adicionar testes automatizados (por exemplo, Jest/Vitest com mocks HTTP).
- Preparar o pacote para publicação em um registro npm privado caso seja necessário distribuir o node.

Autor: Vinícius Augusto Alves Santos Mello
