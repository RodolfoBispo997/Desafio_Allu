# investment-review

Bootstrap do desafio técnico Full Stack para avaliação de investimentos.

## Stack

- Backend: NestJS, Prisma, PostgreSQL, Swagger e Jest.
- Frontend: React, Vite, React Router, TanStack Query, React Hook Form, Zod e Axios.

## Requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose

## Como executar

1. Crie os arquivos de ambiente:

   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```

2. Inicie o PostgreSQL:

   ```bash
   docker compose up -d
   ```

3. Instale e execute o backend:

   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

4. Em outro terminal, instale e execute o frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:3333/api
- Swagger: http://localhost:3333/api/docs
