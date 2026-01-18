# Epaper API - Documentação Técnica

API construída com **NestJS** e **TypeORM**, utilizando **PostgreSQL** como banco de dados e **Minio** para armazenamento de arquivos.  
O projeto é modular, testável e conta com integração contínua e deploy automático via **GitHub Actions**.

---

## Arquitetura

### Estrutura do Projeto
- **Modularização:** 
A aplicação é totalmente **modularizada** seguindo boas práticas do NestJS:

    **AuthModule:**  
  Responsável por autenticação JWT e OAuth2 (Google).  
  Contém controllers para login, logout, refresh de token e endpoints de integração com Google OAuth.  

    **UsersModule:**  
  Gerencia usuários do sistema. Inclui criação, atualização, leitura e exclusão.  
  Implementa regras de negócio como hash de senha com bcrypt e verificação de permissões.  

    **DocumentsModule:**  
  Gerencia upload, download e listagem de documentos.  
  Faz integração com **Minio** e mantém o controle de metadados no PostgreSQL.  
  Suporta tipos de documentos (`document_type_enum`) e tipos de arquivo (`file_type_enum`).  

    **IssuerModule:**  
  Controla emissoras/criadores de documentos, garantindo integridade referencial e relacionamento com usuários criadores.  

    **CommonModule:**  
  Contém utilitários e serviços compartilhados, como `DatabaseService`, validação global de DTOs e filtros de exceção.

  Cada módulo possui seus **controllers**, **services** e **entities**, mantendo a aplicação desacoplada e testável.

- **Camadas:**  
  - **Controller:** Recebe requisições HTTP e delega para o serviço correspondente.  
  - **Service:** Contém a lógica de negócio.  
  - **Repository (TypeORM):** Acesso ao banco de dados, abstraindo consultas SQL.  
- **DTOs & Validation:** Todos os inputs são validados usando `class-validator` e `class-transformer`.  
- **Entities:** Representam tabelas do banco de dados, incluindo enums para tipos de documento e arquivos.

---

## Banco de Dados

- **PostgreSQL** como banco relacional principal.
- **TypeORM** para mapeamento objeto-relacional.
- **Migrations:** Todas as mudanças de schema são versionadas via TypeORM migrations.
- **Test Database:** Testes E2E utilizam banco isolado (`epaper_test_db`) criado dinamicamente para garantir independência do ambiente principal.
- **Extensões utilizadas:** `uuid-ossp` para geração de UUIDs.

---

## Armazenamento de Arquivos

- **Minio** como serviço S3 compatível.
- Arquivos armazenados em bucket `documents`.
- Configuração inclui `S3_FORCE_PATH_STYLE` para compatibilidade com Minio local.
- Estratégia de upload e download via SDK AWS S3.

---

## Autenticação & Autorização

- **JWT**:  
  - Tokens de acesso (`JWT_SECRET`) e refresh (`REFRESH_JWT_SECRET`) separados.  
  - Expiração configurável via `.env`.
- **OAuth2 via Google:**  
  - Integrado com Passport.js (`passport-google-oauth20`).  
  - Estratégia configurável via `.env` (`clientID`, `clientSecret`, `callbackURL`).

---

## Testes
- **Testes Unitários**

    **Framework:** Jest + ts-jest.  
   **Cobertura:**  
     - Serviços (`Services`) são testados isoladamente com mocks de repositórios.  
     - Controllers testam respostas HTTP simulando chamadas de serviços.  
     - Estratégia de mocks para OAuth2 e integração com Minio nos testes unitários.  

   **Boas práticas:**  
     - Testes unitários são independentes de banco de dados real.
     - Testes unitários complementam os **E2E tests**.  

   **Comando:**  
        ```bash
        npm run test
        ```
- **E2E:**
  - Jest + Supertest.
  - Banco de testes isolado criado automaticamente.
  - Limpeza completa após cada suite.
  - Cobertura mínima de endpoints críticos: autenticação, upload/download de arquivos e CRUD de documentos.
- **Configuração CI:**
  - Testes executados no workflow do GitHub Actions com `docker-compose` simulando Postgres e Minio.
  - Variáveis de ambiente isoladas para CI (`DATABASE_DB=epaper_test_ci_db`).

---

## Docker

- **docker-compose.yml**:
  - Instancia Postgres e Minio para desenvolvimento/testes.
  - Permite replicar ambiente local idêntico ao CI.
- **Docker para CI/CD:** Workflow do GitHub Actions utiliza containers para consistência e isolamento.

---

## CI/CD - GitHub Actions

- Workflow `ci.yml`:
  - Dispara em `push` ou `pull_request` na branch `main`.
  - Passos:
    1. Checkout do repositório.
    2. Setup Node.js.
    3. Build e instalação de dependências (`npm ci`).
    4. Start de Postgres e Minio em containers.
    5. Espera por saúde dos serviços (`pg_isready`, endpoint de saúde do Minio).
    6. Rodar testes E2E com banco e Minio isolados.

---

## Logging & Observabilidade

- **NestJS Logger** para logs de queries e eventos.
- Logs do banco detalham queries executadas durante E2E.
- Estrutura modular facilita interceptação de logs em cada módulo.

---

## Segurança

- Senhas armazenadas com **bcrypt**.
- JWT tokens assinam payloads críticos.
- Google OAuth strategy valida `clientID` e `clientSecret`.

---

## Stack

- **NestJS:** 
- **TypeORM:** 
- **Minio:** 
- **Docker + Compose:** 
- **GitHub Actions:** 
- **Jest:** 

---

## Documentação com Swagger

- A API é documentada automaticamente via **NestJS Swagger** (`@nestjs/swagger`).  
- Cada endpoint possui **descrição, parâmetros, tipos e responses**, garantindo fácil consumo por front-end e clientes externos.  
- **Exemplo:**  
  - Endpoint `/auth/login` documenta o payload de entrada e saída.
  - Enums (`document_type_enum`, `file_type_enum`, `origin_enum`) aparecem como opções válidas na documentação.  
- **Acessível em ambiente local:** `http://localhost:5000/swagger`.

## Futuras Melhorias

- Adicionar **Redis** para filas de processamento.
- Implementar monitoramento.

---

## Contato

Victor Souza - [github.com/viktormendes](https://github.com/viktormendes)
