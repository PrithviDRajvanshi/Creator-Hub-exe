# Kalvium Mandatory Concepts — Full Codebase Audit

Audit performed by reading every source file in the repository. No files were modified.

---

## Audit Table

| # | Concept | Status | File(s) | Evidence | Demonstrable? | Missing/Fix |
|---|---------|--------|---------|----------|---------------|-------------|
| **AI** | | | | | | |
| 1 | LLM API Integration | ✅ FULLY IMPLEMENTED | `server/services/geminiService.ts`, `server/controllers/aiController.ts`, `server/routes/aiRoutes.ts`, `server.ts` L1, `.env` | `getAIClient()` reads `process.env.GEMINI_API_KEY`, calls `ai.models.generateContent()` with `gemini-3.6-flash`. Key never sent to frontend. `dotenv/config` loaded in `server.ts`. 6 AI endpoints mounted. Responses logged to `AIRequest` model. | Yes — via AI Assistant page, Content Form AI buttons | None |
| 2 | Prompt Engineering | ✅ FULLY IMPLEMENTED | `server/utils/promptDefense.ts` L59-74, `server/services/geminiService.ts` (all 6 functions) | `buildSystemInstructions(role, task, expectedResponse)` produces structured prompts with `### Role`, `### Task`, `### Constraints`, `### Expected Response`. Each caller adds `### Context` with user data wrapped in `<user_content>` tags. | Yes — inspect any AI generation output | None |
| 3 | Function Calling / Tool Use | ✅ FULLY IMPLEMENTED | `server/services/geminiTools.ts` L5-47, `server/services/geminiService.ts` L207-285 | 4 `FunctionDeclaration[]` using `@google/genai` `Type` enum. `runAssistantToolChat` passes `tools` config to Gemini, reads `response.functionCalls`, executes via `executeToolCall()` switch, sends result back for synthesis. | Yes — AI Assistant chat tab, ask "how many posts do I have?" | None |
| 4 | Prompt Injection Defense | ✅ FULLY IMPLEMENTED | `server/utils/promptDefense.ts` L1-57, `src/components/PromptInjectionWarning.tsx` | 9 regex patterns detect injection attempts. Input capped, delimiter-escape tags replaced, wrapped in `<user_content>`. `isSuspicious` flag propagated to controller → response → frontend warning component. System instructions explicitly reject embedded commands. | Yes — type "ignore previous instructions" in any AI field | None |
| **Auth & Security** | | | | | | |
| 5 | JWT | ✅ FULLY IMPLEMENTED | `server/controllers/authController.ts` L7-12, `server/middleware/authMiddleware.ts` L9-41, `src/services/api.ts` L13-21 | `jwt.sign({id}, secret, {expiresIn})` on login/register. `protect` middleware extracts Bearer token, `jwt.verify()`, attaches `req.user`. Axios interceptor auto-attaches token. | Yes — login flow, all protected routes | None |
| 6 | Password Hashing | ✅ FULLY IMPLEMENTED | `server/models/User.ts` L79-90 | `UserSchema.pre('save')` hashes with `bcrypt.genSalt(10)` + `bcrypt.hash()`. `comparePassword` method uses `bcrypt.compare()`. Password field has `select: false`. | Yes — register, login, change password | None |
| 7 | Rate Limiting | ✅ FULLY IMPLEMENTED | `server/middleware/rateLimiter.ts`, `server.ts` L48, `server/routes/authRoutes.ts` L8-9, `server/routes/aiRoutes.ts` L17 | 3 limiters: `apiLimiter` (150/15min on `/api`), `authLimiter` (20/15min on auth routes), `aiLimiter` (30/15min on AI routes). All mounted via `router.use()`. | Yes — hit any endpoint rapidly | None |
| 8 | Role-Based Authorization | ✅ FULLY IMPLEMENTED | `server/middleware/authMiddleware.ts` L44-61, `server/routes/adminRoutes.ts` L13-14, `src/App.tsx` L53-56 | `authorize(...roles)` middleware checks `req.user.role` against allowed roles. Admin routes use `authorize('ADMIN')`. Frontend guards admin page with `user.role === 'ADMIN'` check. | Yes — login as USER, try `/admin` → blocked | None |
| 9 | Input Sanitization | ✅ FULLY IMPLEMENTED | `server/utils/promptDefense.ts` L20-56 | `sanitizeAndGuardPrompt()`: trims, caps length, escapes `</user_content>` and `</system>` tags, wraps in structural boundaries. Applied to every AI service function. | Yes — part of every AI request flow | None |
| 10 | Request Validation | ✅ FULLY IMPLEMENTED | `server/validators/aiValidator.ts`, `server/validators/authValidator.ts`, `server/validators/contentValidator.ts`, `server/middleware/errorHandler.ts` L20-27 | Zod schemas (`z.object`, `z.string().min().max()`, `z.enum()`) validate all request bodies. `errorHandler` catches `ZodError` → returns 422 with field-level details. | Yes — submit empty form or invalid data | None |
| **Backend** | | | | | | |
| 11 | RESTful API Design | ✅ FULLY IMPLEMENTED | All 5 route files in `server/routes/` | Proper HTTP verbs: `POST /content` (create), `GET /content` (list), `GET /content/:id` (read), `PUT /content/:id` (update), `DELETE /content/:id` (delete). Consistent `{success, data}` response shape. Resource-based URLs. | Yes — entire app uses REST endpoints | None |
| 12 | Middleware | ✅ FULLY IMPLEMENTED | `server.ts` L29-67, all middleware files | `helmet`, `cors`, `express.json`, `apiLimiter`, `protect`, `authorize`, `errorHandler`, `uploadMiddleware` — all used via `app.use()` or `router.use()`. Custom error handler is a 4-arg Express middleware. | Yes — every request passes through middleware chain | None |
| 13 | HTTP Status Codes | ✅ FULLY IMPLEMENTED | All controller files | Uses: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict/duplicate), 422 (validation error), 500 (server error). Mongoose CastError → 400, duplicate key → 409. | Yes — observable in API responses | None |
| 14 | File Upload | ✅ FULLY IMPLEMENTED | `server/controllers/mediaController.ts`, `server/routes/mediaRoutes.ts` L9, `src/pages/ContentFormPage.tsx` L196-216 | Multer with disk storage, MIME type filter (JPEG/PNG/WEBP/GIF), 5MB limit. `POST /api/media/upload` saves to `uploads/`, creates `Media` document. Frontend sends `multipart/form-data` via `<input type="file">`. | Yes — upload image in Content Form | None |
| **Frontend / JavaScript** | | | | | | |
| 15 | Async / Promises | ✅ FULLY IMPLEMENTED | Every page component, `src/services/api.ts`, `src/context/AuthContext.tsx` | `async/await` used in all API calls. `Promise.all()` in `contentController.ts` L52, L166. Axios interceptors return `Promise.reject()`. Try/catch/finally pattern throughout. | Yes — every user action triggers async flow | None |
| 16 | Closures | ✅ FULLY IMPLEMENTED | `src/context/AuthContext.tsx` L17-79, `src/services/api.ts` L13-21, `server/middleware/authMiddleware.ts` L44 | `AuthProvider` closes over `user`/`token` state. `authorize(...roles)` is a closure factory returning middleware that captures `roles`. Axios interceptor callback closes over `localStorage`. | Yes — inherent in React context & middleware factory | None |
| 17 | Hoisting | ⚠️ PARTIALLY IMPLEMENTED | All files use `const`/`let`, `import`, named `function` | The project uses ES modules and TypeScript throughout. Named `function` declarations (e.g., `function getAIClient()` at L7 of geminiService.ts) demonstrate hoisting — they are called after definition. However, there is no **explicit demonstration or teaching example** of hoisting behavior (var vs let, TDZ). | Implicitly — function declarations are hoisted | Add a code comment or doc explaining hoisting if needed for viva |
| 18 | Event Loop | ⚠️ PARTIALLY IMPLEMENTED | `server.ts` (async server startup), all `async` handlers, `useEffect` callbacks | The entire app relies on the event loop: Express request handling, `await` yields to event loop, `useEffect` schedules side effects after render, `setTimeout` not explicitly used. However, there is no **explicit demonstration** (e.g., `setTimeout` vs `Promise` ordering). | Implicitly — the app runs on it | Add a comment or doc if needed for viva |
| 19 | React Component Composition | ✅ FULLY IMPLEMENTED | `src/App.tsx`, all components | `App` composes `AuthProvider` > `BrowserRouter` > `ProtectedLayout` > `Navbar` + `Sidebar` + page routes. `ProtectedLayout` is a composed layout guard. Pages use shared components (`PromptInjectionWarning`). Props flow: `Navbar` receives `isSidebarOpen`/`onToggleSidebar`. | Yes — visible in component tree | None |
| 20 | useState | ✅ FULLY IMPLEMENTED | Every page/component | Extensive: `LoginPage` (4 states), `ContentFormPage` (15+ states), `AIAssistantPage` (20+ states), `AuthContext` (3 states). State drives all UI: forms, loading indicators, error messages, AI results. | Yes — every interactive element | None |
| 21 | useEffect | ✅ FULLY IMPLEMENTED | `src/context/AuthContext.tsx` L27-43, `src/pages/DashboardPage.tsx` L23-37, `src/pages/ContentFormPage.tsx` L51-75, `src/pages/AIAssistantPage.tsx` L80-84 | Auth verification on mount, dashboard stats fetch, content load on edit, history fetch on tab change. Dependency arrays used correctly (`[]` for mount, `[activeTab]` for conditional). | Yes — data loads on page navigation | None |
| 22 | Form Handling | ✅ FULLY IMPLEMENTED | `LoginPage`, `RegisterPage`, `ContentFormPage`, `ProfilePage`, `AIAssistantPage` | `<form onSubmit={handleSubmit}>`, `e.preventDefault()`, controlled inputs with `value`/`onChange`, loading/disabled states, error display, success feedback. Multiple forms on ProfilePage (profile + password). | Yes — every form in the app | None |
| 23 | Route / API Handling | ✅ FULLY IMPLEMENTED | `src/App.tsx` (React Router), `src/services/api.ts` (Axios), all 5 backend route files | Frontend: `BrowserRouter`, `Routes`, `Route`, `Navigate`, `useNavigate`, `useParams`, `Link`. Backend: `Router()`, RESTful route mounting. Axios instance with interceptors for auth token and 401 handling. | Yes — navigate the app | None |
| 24 | Responsive Styling | ✅ FULLY IMPLEMENTED | All TSX files, `src/index.css` | Tailwind CSS v4 with responsive prefixes: `sm:`, `md:`, `lg:` throughout. Examples: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (Dashboard), `hidden sm:flex` (Navbar), `flex-col sm:flex-row` (headers), mobile sidebar toggle. | Yes — resize browser window | None |
| **MongoDB** | | | | | | |
| 25 | MongoDB CRUD | ✅ FULLY IMPLEMENTED | `server/controllers/contentController.ts`, `server/controllers/authController.ts`, `server/controllers/adminController.ts` | **C**: `Content.create()`, `User.create()`. **R**: `Content.find()`, `Content.findOne()`, `User.findOne()`, `User.findById()`. **U**: `content.save()`, `user.save()`, `Object.assign()`. **D**: `Content.findOneAndDelete()`, `Content.findByIdAndDelete()`. All connected to routes. | Yes — create/edit/delete content, register/login | None |
| 26 | MongoDB Aggregation | ✅ FULLY IMPLEMENTED | `server/controllers/contentController.ts` L166-191, `server/controllers/adminController.ts` L12-19 & L128-135, `server/services/geminiTools.ts` L58-74 | `$match`, `$group`, `$sum`, `$cond`, `$push` operators used. Dashboard stats pipeline groups by userId, computes published/draft counts. Admin aggregates content counts per user. Tool function aggregates category breakdown. | Yes — Dashboard stats, Admin stats | None |
| 27 | MongoDB Schema Design | ✅ FULLY IMPLEMENTED | All 4 model files in `server/models/` | 4 Mongoose schemas with TypeScript interfaces. Proper types, required fields, enums, defaults, `trim`, `maxlength`, `select: false` (password). `ref: 'User'` for relationships. `timestamps: true`. Pre-save hooks. Instance methods (`comparePassword`). | Yes — data integrity enforced | None |
| 28 | MongoDB Indexing | ✅ FULLY IMPLEMENTED | `server/models/User.ts` L38,50,56, `server/models/Content.ts` L25,41,46,52,76, `server/models/AIRequest.ts` L21,27,39 | Field indexes: `email` (unique), `role`, `status`, `userId`, `category`, `tags`, `operationType`, `isSuspicious`. Compound text index: `ContentSchema.index({ title: 'text', body: 'text', tags: 'text' })`. | Yes — query performance | None |
| **SQL** | | | | | | |
| 29 | SQL JOINs | ❌ NOT IMPLEMENTED | N/A | Project uses MongoDB exclusively. No SQL database. | No | Not applicable to this MongoDB project |
| 30 | SQL Transactions | ❌ NOT IMPLEMENTED | N/A | No SQL database present. | No | Not applicable |
| 31 | SQL Normalization | ❌ NOT IMPLEMENTED | N/A | No SQL database present. | No | Not applicable |
| 32 | Prisma / Sequelize ORM | ❌ NOT IMPLEMENTED | N/A | Project uses Mongoose ODM, not a SQL ORM. | No | Not applicable |
| **Engineering** | | | | | | |
| 33 | Env Variables & Secrets | ✅ FULLY IMPLEMENTED | `.env`, `.env.example`, `.gitignore` L7-8, `server.ts` L1 | `.env` contains `GEMINI_API_KEY`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`. `.gitignore` excludes `.env*` but keeps `.env.example`. `dotenv/config` imported at server entry. Keys read via `process.env`. Never exposed to frontend. | Yes — server starts with env vars | None |
| 34 | Git Workflow | ❌ NOT IMPLEMENTED | No `.git` directory | `git log` returns "fatal: not a git repository". Project was downloaded from AI Studio, no git history exists. | No | Run `git init`, make initial commit, push to GitHub |
| 35 | Unit Tests | ⚠️ PARTIALLY IMPLEMENTED | `server/tests/runTests.ts` | Custom test runner with `assert()` function. Tests: prompt injection detection (2 tests), auth validation schemas (3 tests), content validation schema (2 tests). Total: 7 assertions. However: no test framework (Jest/Vitest), no mocking, no coverage, no CI integration. Tests are pure function tests only — no HTTP/API tests. | Yes — `npm run test` | Add a proper test framework, more coverage |
| 36 | Automated API / Integration Tests | ❌ NOT IMPLEMENTED | N/A | No supertest, no API endpoint tests, no integration test files. The existing `runTests.ts` only tests pure utility functions and Zod schemas, not actual HTTP routes or database operations. | No | Add supertest or similar for endpoint testing |

---

## TOTALS

- ✅ **Fully Implemented: 28**
- ⚠️ **Partially Implemented: 3** (Hoisting, Event Loop, Unit Tests)
- ❌ **Not Implemented: 5** (SQL JOINs, SQL Transactions, SQL Normalization, Prisma/Sequelize, Git Workflow, Automated API Tests → Note: 4 SQL concepts are N/A for a MongoDB project)

---

## Top 5 Mandatory Concepts to Implement/Fix Next

### 1. Git Workflow (❌ → ✅)
- **Files:** Root directory (no `.git` exists)
- **What to change:** `git init`, create `.gitignore` (already exists), initial commit, push to GitHub with meaningful branch strategy
- **Demo:** Show git log, branches, commit history in viva
- **Viva explanation:** "We use Git for version control. Our `.gitignore` excludes `node_modules/` and `.env*` files to protect secrets and keep the repo clean. We follow a feature-branch workflow."

### 2. Automated API / Integration Tests (❌ → ✅)
- **Files:** Create `server/tests/api.test.ts`
- **What to change:** Install `supertest`. Write tests that start the Express app, hit endpoints like `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/content`, verify status codes and response shapes. Test auth middleware rejects unauthenticated requests.
- **Demo:** Run `npm run test` and show passing API tests
- **Viva explanation:** "We use supertest to make real HTTP requests against our Express app in-memory. This verifies our middleware chain, validation, auth guards, and response contracts end-to-end without needing a browser."

### 3. Unit Tests — Expand Coverage (⚠️ → ✅)
- **Files:** `server/tests/runTests.ts` (or migrate to Vitest)
- **What to change:** Add tests for: JWT token generation/verification, password hashing round-trip, rate limiter config validation, content CRUD operations (with mock DB). Consider migrating to Vitest for proper test runner with coverage reporting.
- **Demo:** Run test suite, show coverage report
- **Viva explanation:** "We test our security-critical utilities in isolation — JWT signing, bcrypt hashing, input validation — to catch regressions before they reach production. Our test suite runs via `npm run test`."

### 4. Hoisting — Add Explicit Demonstration (⚠️ → ✅)
- **Files:** Add comment/example in `server/utils/` or create a small documented utility
- **What to change:** Add a documented code comment in an existing file showing why `function` declarations work before their textual position (already happening in `geminiService.ts` where `getAIClient()` is defined as a function declaration). Alternatively, add a brief section in README.
- **Demo:** Point to `getAIClient()` function declaration usage pattern in viva
- **Viva explanation:** "JavaScript hoists function declarations to the top of their scope, so `getAIClient()` can be called before its definition in the file. We use `const` for variables to avoid hoisting pitfalls of `var`, which would be hoisted as `undefined`."

### 5. Event Loop — Add Explicit Demonstration (⚠️ → ✅)
- **Files:** Add comment in `server.ts` or create a documented utility
- **What to change:** Add a code comment in `server.ts` near the async server startup explaining how `await connectDB()` yields to the event loop. Optionally add a small demonstrative comment showing microtask (Promise) vs macrotask (setTimeout) ordering.
- **Demo:** Explain the async server startup flow in viva
- **Viva explanation:** "Our server uses `async/await` extensively. When we `await connectDB()`, the function yields control back to the event loop, allowing other I/O operations. Express request handlers are event-loop callbacks — each incoming request is a macrotask, and our `await` calls within handlers create microtasks that resolve before the next macrotask."
