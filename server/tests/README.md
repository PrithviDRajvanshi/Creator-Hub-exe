# AI CreatorHub Test Environment Setup

This project uses **Vitest** for running unit and integration tests. The test suite includes integration tests that require a live PostgreSQL database for the billing service (Prisma).

## PostgreSQL Test Database Setup

The tests require a running PostgreSQL database to verify Prisma schemas, explicit SQL JOINs, and transaction rollbacks.

### 1. Which PostgreSQL database is required?
You must have a PostgreSQL database available for tests. 
The easiest way is to use the local Prisma Development database provided via the Prisma CLI (`npx prisma dev`), which spins up a lightweight PostgreSQL instance automatically.

### 2. Which environment variable points to it?
The test suite respects the `DATABASE_URL_TEST` environment variable. 
If `DATABASE_URL_TEST` is not provided, it falls back to `DATABASE_URL`.
If neither is set, it defaults to: `postgres://postgres:postgres@localhost:51214/template1` (which is the default URL for the Prisma local development server).

You can define this in your `.env.test` or export it before running the tests:
```bash
export DATABASE_URL_TEST="postgres://user:password@localhost:5432/test_db"
```
*(Never use production database credentials for testing!)*

### 3. How to initialize/migrate the test database
Make sure your test database is running, then apply the schema using:
```bash
npx prisma db push
```
*(If you are using a custom `DATABASE_URL_TEST`, run: `DATABASE_URL=$DATABASE_URL_TEST npx prisma db push`)*

### 4. How to seed required Plan/PlanFeature data
The API integration tests for billing expect the database to have `Plan` and `PlanFeature` records initialized. A seed script is provided to automate this.
Run:
```bash
npx prisma db seed
```
*(This executes `npx tsx prisma/seed.ts` as defined in `prisma.config.ts`)*

### 5. How to run the tests
Once the database is running, pushed, and seeded, you can run the entire test suite using:
```bash
npm test
```
To run tests in watch mode during development:
```bash
npm run test:watch
```
