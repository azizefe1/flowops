\# FlowOps



FlowOps is a multi-tenant B2B operations platform for managing products, inventory, orders, team roles, and audit logs.



\## Project Goal



The goal of this project is to build a real-world SaaS-style operations platform using modern software engineering practices.



FlowOps focuses on:



\- Multi-tenant architecture

\- Role-based access control

\- Relational database design

\- REST API development

\- Dashboard-based user experience

\- Audit logging

\- Docker-based development environment

\- Technical documentation



\## Core Features



\- Multi-tenant organization structure

\- User authentication

\- Role-based access control

\- Product management

\- Inventory movement tracking

\- Order management

\- Audit logs

\- Dashboard summary

\- Docker-based local development

\- API documentation

\- Backend tests



\## Tech Stack



\### Frontend



\- Next.js

\- TypeScript

\- Tailwind CSS



\### Backend



\- FastAPI

\- SQLAlchemy

\- Alembic

\- PostgreSQL

\- JWT Authentication

\- Pytest



\### Infrastructure



\- Docker

\- Docker Compose

\- Redis



\## Project Structure



```text

flowops/

├── frontend/

├── backend/

│   ├── app/

│   │   ├── api/

│   │   ├── core/

│   │   ├── db/

│   │   ├── models/

│   │   ├── schemas/

│   │   └── services/

│   └── tests/

├── docs/

│   ├── screenshots/

│   ├── architecture.md

│   ├── database-design.md

│   └── api-overview.md

├── infra/

├── docker-compose.yml

├── .env.example

├── .gitignore

└── README.md

```



\## Development Status



This project is currently under active development.



\## Roadmap



\- \[x] Initialize project structure

\- \[x] Add Docker Compose base services

\- \[ ] Setup FastAPI backend

\- \[ ] Setup PostgreSQL connection

\- \[ ] Setup database migrations with Alembic

\- \[ ] Setup Next.js frontend

\- \[ ] Implement authentication

\- \[ ] Implement organizations

\- \[ ] Implement role-based access control

\- \[ ] Implement product management

\- \[ ] Implement inventory tracking

\- \[ ] Implement order workflow

\- \[ ] Implement audit logs

\- \[ ] Add backend tests

\- \[ ] Deploy project



\## Local Development



Start PostgreSQL and Redis:



```bash

docker compose up -d

```



Stop services:



```bash

docker compose down

```



\## License



This project is developed for portfolio and learning purposes.



