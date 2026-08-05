# investment-review

Desafio técnico Full Stack para avaliação de investimentos.

## Stack

- Backend: NestJS, TypeScript, Prisma, PostgreSQL, Swagger e Jest.
- Frontend: React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod e Axios.

## Requisitos locais

- Node.js 20+
- npm 10+
- Docker e Docker Compose

## Como executar

1. Crie os arquivos de ambiente.

PowerShell (Windows):

```powershell
cd backend
copy .env.example .env
cd ../frontend
copy .env.example .env
```

Linux/macOS:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Inicie o PostgreSQL na raiz do projeto:

```bash
docker compose up -d
```

O PostgreSQL do projeto fica disponível em `localhost:5433`. A porta interna do container permanece `5432`.

3. Instale as dependências do backend, execute as migrations e o seed:

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
```

4. Inicie o backend:

```bash
npm run start:dev
```

5. Em outro terminal, instale as dependências e inicie o frontend:

```bash
cd frontend
npm install
npm run dev
```

## Tokens de teste

O seed cria convites para diferentes cenários:

- `valid-review-invitation`
- `expired-review-invitation`
- `used-review-invitation`
- `active-investment-invitation`

## URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:3333/api
- Swagger: http://localhost:3333/api/docs

Opcionalmente, para inspecionar o banco:

```bash
cd backend
npx prisma studio
```

## Fluxo principal

1. O cliente acessa a avaliação utilizando um token de convite.
2. O backend valida o convite e o investimento relacionado.
3. O cliente informa três notas, comentário, aceite da política e anexos opcionais.
4. A avaliação é criada com status `PENDING_MODERATION`.
5. O moderador acessa a fila de avaliações pendentes.
6. A avaliação pode ser aprovada ou rejeitada.
7. Em caso de rejeição, o motivo da moderação é registrado.

## Premissas e regras de negócio

O enunciado deixa algumas regras em aberto. Para esta implementação foram adotadas as seguintes decisões:

- Apenas investimentos encerrados podem receber avaliações.
- Cada investimento pode possuir apenas uma avaliação.
- O convite possui prazo de expiração.
- Cada convite pode ser utilizado apenas uma vez.
- As notas devem ser números inteiros entre 1 e 5.
- O comentário deve possuir entre 10 e 2000 caracteres.
- O aceite da política é obrigatório.
- A versão da política aceita é armazenada junto à avaliação.
- Toda nova avaliação é criada com status `PENDING_MODERATION`.
- Uma avaliação já aprovada ou rejeitada não pode ser moderada novamente.
- A rejeição exige um motivo.
- A fila de moderação é ordenada das avaliações mais antigas para as mais recentes.
- São permitidos até 3 anexos opcionais por avaliação.
- Cada anexo pode possuir até 5 MB.
- Os formatos aceitos são PDF, JPEG e PNG.

Essas regras foram definidas para evitar avaliações duplicadas, manter o fluxo previsível e preservar informações relevantes para auditoria.

## Arquitetura

O backend foi organizado separando responsabilidades entre:

- `domain`: entidades e regras de negócio;
- `application`: casos de uso e contratos de repositório;
- `infrastructure`: implementação da persistência e integrações;
- `presentation`: controllers e DTOs HTTP.

As entidades protegem as invariantes de domínio, enquanto os casos de uso coordenam os fluxos da aplicação.

Os contratos de repositório evitam que a camada de aplicação dependa diretamente do Prisma.

O armazenamento de arquivos também é abstraído através de `FileStorage`, permitindo trocar o filesystem local por outro mecanismo de armazenamento sem alterar o fluxo principal da aplicação.

## Consistência e persistência

A criação da avaliação e a marcação do convite como utilizado são executadas na mesma transação do PostgreSQL.

Isso evita cenários em que a avaliação seja criada sem consumir o convite ou o convite seja consumido sem a criação da avaliação.

Como o filesystem não participa da transação do banco de dados, os arquivos já armazenados são removidos caso a persistência da avaliação falhe.

Essa compensação reduz o risco de arquivos órfãos.

## Anexos

Nesta implementação, os anexos são armazenados localmente em:

```text
backend/uploads
```

O filesystem local foi escolhido por simplicidade para o ambiente do desafio.

Em produção, o armazenamento poderia ser substituído por serviços de object storage como Amazon S3, Google Cloud Storage ou Azure Blob Storage.

## Considerações técnicas

Algumas decisões foram tomadas considerando o escopo de um desafio técnico, priorizando clareza, consistência das regras de negócio e possibilidade de evolução.

- A aplicação foi estruturada separando domínio, casos de uso, infraestrutura e camada HTTP para reduzir acoplamento entre regras de negócio e detalhes de implementação.
- As regras críticas permanecem no domínio, enquanto os casos de uso coordenam o fluxo da aplicação.
- Os contratos de repositório permitem que a aplicação não dependa diretamente do Prisma.
- O armazenamento de arquivos possui uma abstração própria, permitindo substituir o filesystem local por object storage futuramente.
- O consumo do convite e a criação da avaliação são persistidos na mesma transação para evitar estados inconsistentes.
- O armazenamento de arquivos ocorre fora da transação do banco. Por isso, foi implementada uma compensação que remove arquivos já salvos caso a persistência da avaliação falhe.
- As regras que não estavam explicitamente definidas no enunciado foram tratadas como premissas do produto e documentadas neste README.
- A implementação foi mantida intencionalmente simples em pontos onde uma solução mais complexa não traria benefício proporcional ao escopo do desafio.

## Riscos e pontos de atenção

Em um ambiente de produção, alguns pontos exigiriam atenção adicional.

### Controle de acesso

A área de moderação não possui autenticação ou autorização nesta versão.

Em produção, os endpoints de listagem, aprovação e rejeição deveriam ser acessíveis apenas por usuários autorizados, utilizando autenticação e controle de permissões.

### Escalabilidade da fila de moderação

A listagem atual retorna as avaliações pendentes sem paginação.

Com um volume de milhares de clientes e avaliações, isso pode aumentar consumo de memória, tempo de resposta e tráfego de dados.

Uma evolução seria utilizar paginação, preferencialmente baseada em cursor.

### Armazenamento de anexos

Os anexos são armazenados no filesystem local.

Essa estratégia é suficiente para execução local e para o escopo do desafio, mas apresenta limitações em ambientes distribuídos ou com múltiplas instâncias da aplicação.

Em produção, seria utilizado object storage privado, como Amazon S3, Google Cloud Storage ou Azure Blob Storage.

### Segurança dos arquivos

A validação atual considera quantidade, tamanho e MIME type informado no upload.

Em produção, também seria importante:

- validar o conteúdo real do arquivo por assinatura/magic bytes;
- realizar scanning de malware;
- impedir execução ou exposição direta de arquivos;
- utilizar URLs assinadas e temporárias para acesso;
- definir políticas de retenção e exclusão.

### Concorrência

As restrições de unicidade no banco e a transação utilizada na submissão reduzem o risco de avaliações duplicadas ou reutilização do convite.

Ainda assim, cenários de alta concorrência devem continuar sendo tratados também no nível do banco de dados, evitando depender apenas de validações realizadas previamente pela aplicação.

### Observabilidade

A aplicação não possui uma camada completa de observabilidade.

Em produção seriam importantes:

- logs estruturados;
- correlation/request IDs;
- métricas;
- tracing;
- monitoramento de erros e alertas.

### Disponibilidade

O backend e o PostgreSQL representam dependências centrais do fluxo.

Em produção seriam necessárias estratégias de disponibilidade, backup, recuperação de falhas e monitoramento do banco de dados.

## Melhorias e evoluções

Algumas evoluções naturais para a solução seriam:

- autenticação e autorização da área administrativa;
- paginação e filtros adicionais na fila de moderação;
- busca de avaliações por cliente, investimento, período ou status;
- object storage privado para anexos;
- download seguro de anexos por URL assinada;
- validação de arquivos por conteúdo e scanning de malware;
- rate limiting nos endpoints públicos;
- proteção adicional contra abuso de tokens de convite;
- logs estruturados, métricas e tracing;
- testes E2E dos principais fluxos HTTP;
- testes de integração adicionais;
- CI/CD;
- containerização completa de backend e frontend;
- políticas de backup e recuperação;
- políticas de retenção e exclusão dos anexos;
- paginação por cursor para cenários de alto volume;
- notificações ao cliente após conclusão da moderação, caso isso faça parte da evolução do produto.

## Testes e qualidade

O backend possui testes automatizados cobrindo regras de domínio, fluxo de submissão e persistência.

Validações executadas no backend:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run test -- --runInBand
```

Resultado atual:

```text
Test Suites: 4 passed, 4 total
Tests:       25 passed, 25 total
```

Validações executadas no frontend:

```bash
npx tsc --noEmit
npm run lint
npm run build
```
