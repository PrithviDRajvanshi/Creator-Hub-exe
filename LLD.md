# AI-CreatorHub - Low-Level Design (LLD)

## 1. Backend Directory Structure
```text
server/
├── app.ts                  # Express application setup and middleware registration
├── config/
│   └── prisma.ts           # Prisma singleton client instance
├── controllers/            # HTTP request/response handlers
│   ├── adminController.ts
│   ├── aiController.ts
│   ├── authController.ts
│   ├── billingController.ts
│   ├── contentController.ts
│   └── mediaController.ts
├── middleware/             # Express middlewares
│   ├── authMiddleware.ts
│   ├── errorHandler.ts
│   └── rateLimiter.ts
├── models/                 # Mongoose schemas
│   ├── AIRequest.ts
│   ├── Content.ts
│   ├── Media.ts
│   └── User.ts
├── routes/                 # Express routers
│   ├── adminRoutes.ts
│   ├── aiRoutes.ts
│   ├── authRoutes.ts
│   ├── billingRoutes.ts
│   ├── contentRoutes.ts
│   └── mediaRoutes.ts
├── services/               # Core business logic
│   ├── billingService.ts
│   ├── geminiService.ts
│   └── geminiTools.ts
├── tests/                  # Automated tests (Vitest)
│   ├── api/                # Integration tests
│   ├── unit/               # Unit tests
│   └── setup.ts            # Test environment configuration
├── utils/                  # Utility functions
│   ├── javascriptConcepts.ts
│   ├── promptDefense.ts
│   └── seedPlans.ts
└── validators/             # Zod validation schemas
    ├── aiValidator.ts
    ├── authValidator.ts
    └── contentValidator.ts
```

## 2. Frontend Directory Structure
```text
src/
├── components/             # Reusable UI components
│   ├── Navbar.tsx
│   ├── PromptInjectionWarning.tsx
│   └── Sidebar.tsx
├── context/                # React Context providers
│   └── AuthContext.tsx     # Authentication state management
├── pages/                  # Route-level components
│   ├── AdminPage.tsx
│   ├── AIAssistantPage.tsx
│   ├── ContentFormPage.tsx
│   ├── ContentListPage.tsx
│   ├── DashboardPage.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── ProfilePage.tsx
│   └── RegisterPage.tsx
└── services/               # API communication
    └── api.ts              # Axios instance configuration
```

## 3. Detailed Module Responsibilities

### Controllers
- `authController.ts`: Handles `register`, `login`, and `getMe` requests.
- `contentController.ts`: Handles CRUD operations for Content documents.
- `mediaController.ts`: Handles the `uploadImage` POST request.
- `aiController.ts`: Handles LLM generation requests (`generate` and `chat`).
- `adminController.ts`: Handles the retrieval of platform statistics.
- `billingController.ts`: Handles `getPlans`, `subscribe`, and `getHistory`.

### Services
- `billingService.ts`: Manages PostgreSQL interactions for plans, creating subscriptions, and recording payments via Prisma.
- `geminiService.ts`: Initializes the `@google/genai` client, handles text generation, and executes chat sessions with function calling.
- `geminiTools.ts`: Defines the schema of available functions (e.g., `getServerTime`, `getContentStats`) for the LLM to invoke.

### Middleware
- `authMiddleware.ts`: Exports `protect` (verifies JWT) and `authorize` (verifies role arrays).
- `errorHandler.ts`: Catches exceptions, logs them, and returns a uniform JSON error payload.
- `rateLimiter.ts`: Uses `express-rate-limit` to apply the `apiLimiter` to incoming traffic.

## 4. Validation Schemas (Zod)
- `authValidator.ts`: Validates `registerSchema` (email, password, name) and `loginSchema` (email, password).
- `contentValidator.ts`: Validates `contentSchema` (title, body, status).
- `aiValidator.ts`: Validates `generateSchema` (prompt string).

## 5. Database Schemas (MongoDB / Mongoose)
- **User**: `name` (string), `email` (string, unique), `password` (string), `role` (enum: 'USER', 'ADMIN').
- **Content**: `title` (string), `body` (string), `userId` (ObjectId ref User), `status` (enum: 'draft', 'published').
- **Media**: `filename` (string), `originalName` (string), `mimeType` (string), `path` (string), `userId` (ObjectId ref User).
- **AIRequest**: `userId` (ObjectId ref User), `prompt` (string), `response` (string), `createdAt`.

## 6. Database Models (PostgreSQL / Prisma)
Referenced in `prisma/schema.prisma`:
- **Plan**: `id`, `name`, `price`.
- **PlanFeature**: `id`, `planId` (ref Plan), `description`.
- **User**: `id` (matches Mongo ID), `email`.
- **Subscription**: `id`, `userId` (ref User), `planId` (ref Plan), `status`, `startDate`, `endDate`.
- **Payment**: `id`, `subscriptionId` (ref Subscription), `amount`, `status`, `paymentDate`.

## 7. Security Implementation

### Authentication
- `authController.ts` uses `bcrypt.hash()` on registration and `bcrypt.compare()` on login.
- `jsonwebtoken.sign()` generates a token payload containing `{ id, role }`.
- `authMiddleware.ts` extracts the token from the `Authorization: Bearer <token>` header and verifies it.

### Prompt Injection Defense
- `utils/promptDefense.ts` implements a Regex-based defense.
- Scans user prompts for phrases like "ignore previous instructions" or "system prompt".
- Throws an error before `geminiService.ts` is invoked if a match is detected.

## 8. Billing Implementation & Transactions
- Defined in `server/services/billingService.ts`.
- `subscribeToPlan` initiates a transaction: `prisma.$transaction(async (tx) => { ... })`.
- Within `tx`, it sequentially:
  1. `tx.user.upsert` (Syncs the MongoDB user to Postgres lazily).
  2. `tx.subscription.create`.
  3. `tx.payment.create`.
- If any operation fails, the transaction is automatically rolled back by Prisma.
- `getBillingHistory` demonstrates explicit relational SQL by using `prisma.$queryRaw` with manual `JOIN` clauses.

## 9. File Upload Implementation
- Defined in `server/routes/mediaRoutes.ts` using `multer`.
- Configured with `multer.diskStorage()` to save files into the root `/uploads` directory.
- Static file serving is enabled in `server/app.ts` via `app.use('/uploads', express.static(...))`.

## 10. AI Function Calling Implementation
- Defined in `server/services/geminiTools.ts`.
- Exports a `tools` array containing `FunctionDeclaration` objects.
- Exports a `handleToolCall` dispatcher function.
- In `server/services/geminiService.ts` (`chatWithAI`), the service inspects the LLM response for `functionCalls`. If present, it maps the call to `handleToolCall`, executes the local TypeScript function, and sends the result back to the LLM as a `functionResponse`.

## 11. Testing Structure
- Uses `vitest` for the test runner and assertions.
- Uses `supertest` in `server/tests/api/` for simulating HTTP requests.
- Uses `mongodb-memory-server` to mock the NoSQL database during testing.
- Uses `DATABASE_URL_TEST` environment variable to connect to a live Prisma/PostgreSQL test database.
- `server/tests/unit/javascriptConcepts.test.ts` executes pure JS runtime verifications for hoisting and event loop concepts.
