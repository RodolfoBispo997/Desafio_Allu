# investment-review

Desafio técnico Full Stack para avaliação de investimentos.

## Stack

- Backend: NestJS, Prisma, PostgreSQL, Swagger e Jest.
- Frontend: React, Vite, React Router, TanStack Query, React Hook Form, Zod e Axios.

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

2. Inicie o PostgreSQL na raiz do projeto. O PostgreSQL do projeto fica disponível em `localhost:5433` (a porta interna do container permanece `5432`):

   ```bash
   docker compose up -d
   ```

3. Instale dependências, execute a migration e o seed:

   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init_investment_review
   npx prisma db seed
   ```

4. Inicie o backend:

   ```bash
   npm run start:dev
   ```

5. Em outro terminal, inicie o frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Tokens de teste

- `valid-review-invitation`
- `expired-review-invitation`
- `used-review-invitation`
- `active-investment-invitation`

## URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:3333/api
- Swagger: http://localhost:3333/api/docs

Opcionalmente, abra o Prisma Studio com `cd backend` e `npx prisma studio`.
