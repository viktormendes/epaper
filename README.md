# Epaper API

API construída em **NestJS** com **TypeORM**, utilizando **PostgreSQL** como banco de dados e **Minio** para armazenamento de arquivos.  
O projeto conta com Docker para ambiente local e CI/CD configurado via **GitHub Actions** para testes e deploy automático.

---

## Tecnologias utilizadas

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Minio](https://min.io/)
- [Docker & Docker Compose](https://www.docker.com/)
- [GitHub Actions](https://github.com/features/actions)
- Node.js 20+
- npm 10+

---

## Funcionalidades principais

- Autenticação JWT com Roles (login, refresh e logout)
- Integração com Google OAuth
- Upload e download de arquivos para Minio
- API modularizada com NestJS
- Testes E2E utilizando banco de testes isolado

---

## Como instalar

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/epaper-api.git
cd epaper-api
```

### 2. Criar arquivo de variáveis de ambiente

Copie o arquivo de exemplo .env.example para .env e ajuste os valores conforme seu ambiente local:

```bash
cp .env.example .env
```
Exemplo de .env para desenvolvimento/testes:
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_DB=epaper_dev_db

NODE_ENV=development

JWT_EXPIRE_IN=3600
JWT_SECRET=supersecret
REFRESH_JWT_SECRET=superrefreshsecret
REFRESH_JWT_EXPIRE_IN=86400

URL_FRONTEND=http://localhost:3000

S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin123
S3_BUCKET_NAME=documents
S3_FORCE_PATH_STYLE=true
```

### 3. Rodar com Docker

O projeto possui docker-compose.yml para facilitar o ambiente local:
```
docker-compose up -d
```

Isso irá iniciar:

- PostgreSQL na porta 5432

- Minio na porta 9000

### 3. Rodar Manualmente
#### 1. Instalar dependências
```
npm i
```

#### 2. Rodar o projeto
```
npm run start:dev
```
O servidor ficará disponível em http://localhost:3000.