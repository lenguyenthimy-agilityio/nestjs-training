## 📘 Description

This is a **NestJS practice project** focusing on backend fundamentals — **Products** and **Carts** modules — built to learn clean architecture, caching, and testing.

Key features:
- User authentication & JWT authorization
- Role-based access control (Admin, User)
- Product CRUD + pagination & search
- User cart management (add/remove/view)
- Redis caching & logging
- Swagger API documentation
- Unit and E2E testing

---

## 🧩 Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | [NestJS](https://nestjs.com) |
| ORM | [TypeORM](https://typeorm.io) |
| Database | PostgreSQL / SQLite (for test) |
| Caching | Redis |
| Auth | Passport (Local + JWT) |
| Docs | Swagger (OpenAPI) |
| Tests | Jest + Supertest |

---

## ⚙️ Project Setup

```bash
# clone the repository
$ git clone git@github.com:lenguyenthimy-agilityio/nestjs-training.git

# install dependencies
$ npm install
```

### Environment Variables
 - Copy the sample environment file
```bash
cp .env.sample .env
```

---

## ▶️ Run the Project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production
$ npm run start:prod
```

Application will be available at:
👉 [http://localhost:3000](http://localhost:3000)

Swagger docs:
👉 [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🧪 Run Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# coverage report
$ npm run test:cov
```

---

## 🧰 Useful Commands

| Command | Description |
|----------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run start:dev` | Run app in watch mode |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests |
| `npm run test:cov` | Show coverage summary |
