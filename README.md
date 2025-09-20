# Conector Random para n8n

Conector personalizado do n8n que encapsula a API do [Random.org](https://www.random.org/integers/) para gerar números inteiros verdadeiramente aleatórios. O repositório inclui um ambiente Docker Compose com n8n e PostgreSQL já configurados para carregar o node automaticamente.

## Requisitos

- Node.js + TypeScript na versão 22 (LTS)
- npm 10+
- Docker Engine 24+ e Docker Compose v2

## Estrutura do projeto

```
.
├─ docker-compose.yml          # Stack n8n + PostgreSQL
├─ n8n/.n8n/custom/.gitkeep    # Placeholder para a pasta de nodes customizados
├─ packages/random-node        # Código TypeScript do conector
├─ scripts/postbuild.cjs       # Copia artefatos para .n8n/custom
└─ .env.example                # Variáveis de ambiente para execução local
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
   sudo docker compose restart n8n
   ```

O script de build compila o pacote TypeScript (`packages/random-node`) e publica os artefatos em `n8n/.n8n/custom/random`, diretório que é montado no contêiner do n8n.

> **Segurança (local vs. prod)**
>
> * As credenciais padrão `admin/admin` e a `N8N_ENCRYPTION_KEY` fornecidas em `.env.example` servem apenas para desenvolvimento local.
> * Em produção, redefina `N8N_BASIC_AUTH_USER`, `N8N_BASIC_AUTH_PASSWORD` e `N8N_ENCRYPTION_KEY` com valores fortes e exclusivos.

## Executar o n8n localmente

1. Inicialize a stack:
   ```bash
   sudo docker compose up -d
   ```
2. Acesse o painel em [http://localhost:5678](http://localhost:5678) (credenciais padrão `admin/admin`).
3. No editor de workflows, busque pelo node **Random** e escolha a operação *True Random Number Generator*. Informe os inteiros `Min` e `Max` para gerar um número via Random.org.
   - Fora do Docker, o n8n procura custom nodes no diretório `~/.n8n/custom`. O build já mantém os artefatos sincronizados com `n8n/.n8n/custom/random`; basta copiar essa pasta para o caminho padrão da sua máquina caso rode o n8n diretamente, conforme descrito em [Run your node locally](https://docs.n8n.io/integrations/creating-nodes/run-node-locally/).
4. Para encerrar os serviços:
   ```bash
   sudo docker compose down
   ```

## Fluxo de desenvolvimento

- Recompile após qualquer alteração no código do node:
  ```bash
  npm run build
  ```
- O comando limpa artefatos anteriores, roda o TypeScript e atualiza `.n8n/custom`. Reinicie o contêiner do n8n para recarregar o node:
  ```bash
  sudo docker compose restart n8n
  ```
- Rode o lint (ESLint):
  ```bash
  npm run lint
  ```
- Verifique tipos com o TypeScript:
  ```bash
  npm run typecheck
  ```
- Formate os arquivos com Prettier:
  ```bash
  npm run format
  ```
- Rode os testes automatizados (Vitest + mocks HTTP):
  ```bash
  npm test
  ```

## Onde o n8n encontra o node customizado

- Em execução Docker/Compose, o volume `./n8n/.n8n:/home/node/.n8n` disponibiliza o pacote compilado em `/home/node/.n8n/custom/random`, caminho oficial de descoberta de nodes.
- Para execução direta (sem containers), copie ou linke `n8n/.n8n/custom/random` para `~/.n8n/custom/random` antes de iniciar o n8n, seguindo a documentação *Run your node locally*.
- Após qualquer alteração, rode `npm run build` para manter o diretório sincronizado e reinicie o n8n.


## Integração com Random.org

- A operação realiza `GET https://www.random.org/integers/` com `num=1`, repassando os limites `Min` e `Max` e solicitando retorno em texto puro.
- O resultado é validado para garantir que o payload seja um inteiro; respostas inválidas disparam `NodeOperationError` durante a execução do workflow.
- Não é necessário ajustar `NODE_FUNCTION_ALLOW_EXTERNAL` para este conector; a variável só é obrigatória quando se usa Function Node com acesso externo.

## Comandos úteis

- Acompanhar logs do n8n: `sudo docker compose logs -f n8n`
- Resetar o ambiente (remove volumes): `sudo docker compose down -v`
- Limpar artefatos compilados: `npm run clean --workspace @onfly/random-node`

## Troubleshooting

- **Node não aparece no editor**: confirme se `npm run build` foi executado após a última alteração e reinicie o contêiner (`sudo docker compose restart n8n`).
- **Executando sem Docker**: copie `n8n/.n8n/custom/random` para `~/.n8n/custom/random` antes de iniciar o n8n local.
- **Erros na chamada Random.org**: verifique conectividade externa; o node relata `NodeOperationError` quando a resposta não é numérica.
- **Dependências desatualizadas**: rode `npm install` novamente para garantir que o Vitest esteja disponível antes de executar os testes.

## Próximos passos sugeridos

- Adicionar aos testes casos para respostas `429 Too Many Requests` e cenários de timeout, mockando a requisição HTTP.
- Preparar o pacote para publicação privada se o node precisar ser distribuído fora deste repositório.

Autor: Vinícius Augusto Alves Santos Mello
