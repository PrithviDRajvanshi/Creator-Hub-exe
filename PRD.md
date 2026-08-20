# AI-CreatorHub - Product Requirements Document (PRD)

## 1. Product Overview
AI-CreatorHub is a full-stack content management platform designed for modern digital creators. It leverages cutting-edge Generative AI (Google Gemini LLM) to assist users in generating, managing, and optimizing their content while providing a robust suite of tools for content management, media handling, and premium subscriptions.

## 2. Problem Statement
Digital creators face significant challenges in consistently generating high-quality content, managing their media assets, and monetizing their workflows. Existing tools are often fragmented, requiring creators to use separate applications for AI generation, content storage, media hosting, and subscription management. Furthermore, interacting with AI tools requires significant prompting expertise to avoid unsafe or low-quality outputs.

## 3. Product Vision
To provide a secure, unified, AI-powered platform where creators can ideate, draft, manage, and monetize their content seamlessly, supported by an intelligent AI assistant that proactively ensures content safety and quality.

## 4. Goals and Objectives
- **Centralized Management**: Provide a single dashboard for content and media management.
- **AI Acceleration**: Integrate Gemini LLM for content ideation and drafting.
- **Security & Safety**: Implement robust prompt injection defenses and content sanitization.
- **Monetization**: Enable a tiered premium subscription model.
- **Reliability**: Ensure high availability and data integrity using a hybrid database architecture (MongoDB + PostgreSQL).

## 5. Target Users
- **Content Creators**: Bloggers, social media managers, and copywriters looking to accelerate their workflow.
- **Platform Administrators**: Staff responsible for moderating content, managing user access, and viewing platform analytics.

## 6. User Personas
- **"Creative Claire"**: A freelance writer who needs to generate blog outlines quickly, manage her drafts in one place, and store related images.
- **"Admin Alex"**: A system administrator who needs to monitor platform usage, view aggregated statistics, and manage user roles.

## 7. Core User Stories
- As a creator, I want to securely log in and manage my profile so my data is protected.
- As a creator, I want to ask an AI assistant for content ideas so I can overcome writer's block.
- As a creator, I want to create, read, update, and delete my content drafts so I have full control over my work.
- As a creator, I want to upload images so I can attach media to my content.
- As a creator, I want to subscribe to a premium plan so I can access advanced features.
- As an admin, I want to view platform statistics (total users, content generated) so I can understand platform growth.

## 8. Functional Requirements

### Authentication
- User registration with email, name, and secure password.
- JWT-based login and session management.
- Role-based access control (USER vs. ADMIN).

### Content Management
- CRUD operations for text-based content.
- Draft vs. Published status toggling.
- Content filtering and pagination.

### AI Content Generation & Assistant
- Real-time chat interface with Gemini LLM.
- AI Function Calling/Tool Use for executing predefined backend utilities.
- Prompt injection detection and blocking before LLM processing.

### Media Uploads
- Image uploading via `multer`.
- Static file serving for uploaded media assets.
- Association of media URLs with content objects.

### Dashboard & Analytics
- User-specific dashboard showing recent content.
- Admin dashboard utilizing MongoDB aggregation pipelines for platform statistics.

### Billing/Subscriptions
- Tiered subscription plans (Free, Pro).
- Subscription creation and simulated payment processing via explicit SQL Transactions.
- Billing history retrieval using explicit SQL JOINs.

## 9. Non-Functional Requirements
- **Security**: Passwords must be hashed using `bcrypt`. All API endpoints must be protected by Helmet, CORS, and rate limiting.
- **Performance**: API responses should resolve in under 500ms (excluding LLM generation time).
- **Reliability**: Transactional integrity must be maintained for all billing operations using Prisma `$transaction`.
- **Maintainability**: Codebase must use strict TypeScript, centralized error handling, and Zod validation.

## 10. Authentication and Authorization Requirements
- **Implementation**: JSON Web Tokens (JWT).
- **Roles**: `USER`, `ADMIN`.
- **Protection**: Middleware (`protect`, `authorize`) applied to all private `/api/*` routes.

## 11. AI/LLM Requirements
- **Provider**: Google Gemini API.
- **Safety**: Inputs must be checked against known malicious prompt patterns (Prompt Defense).
- **Tools**: AI must have access to registered tools (e.g., getting server time or content stats) via the Gemini Function Calling API.

## 12. Data Requirements
- **MongoDB**: Used for unstructured/flexible data (Users, Content, Media, AIRequests).
- **PostgreSQL**: Used for highly relational, transactional data (Plans, PlanFeatures, Subscriptions, Payments).
- **Normalization**: PostgreSQL schema must adhere to 3NF (Third Normal Form).

## 13. API Requirements
- RESTful API design pattern.
- JSON request/response bodies.
- Standardized error response format: `{ error: string, details?: any }`.

## 14. Error Handling
- Global Express error handling middleware (`errorHandler.ts`).
- Zod schema validation errors mapped to 400 Bad Request.
- Database constraint violations mapped to appropriate HTTP status codes.

## 15. Testing Requirements
- Unit and API Integration tests using `vitest` and `supertest`.
- Minimum of 25 passing test cases.
- Dedicated test PostgreSQL database configured via `DATABASE_URL_TEST`.
- Transaction rollback verification in tests.

## 16. Acceptance Criteria
- User can register, login, and receive a JWT.
- User can successfully generate content via Gemini.
- Malicious prompts are successfully blocked with a 400 status.
- Admin can view aggregated statistics.
- User can subscribe to a plan, creating records atomically in PostgreSQL.
- All 25 automated tests pass.

## 17. Out of Scope
- Actual payment gateway integration (e.g., Stripe, PayPal).
- Email verification and password resets.
- Real-time WebSockets.
- Microservices architecture.

## 18. Future Enhancements
- OAuth2 social logins (Google, GitHub).
- Advanced image generation (e.g., Stable Diffusion integration).
- Team collaboration workspaces.

---

## 19. Problem Modeling & Requirements-to-Implementation Traceability

### 19.1 Identification of Actual Creator Problems

Based on the product vision and domain requirements, digital creators face six concrete operational challenges:

| Priority | Creator Problem | Why It Matters |
|:---|:---|:---|
| **P0** | **Ideation & Content Generation Bottlenecks** | Writer's block and manual drafting slow down production schedules and reduce overall output consistency. |
| **P0** | **Insecure Access & Profile Management** | Creators require secure authentication to protect their drafts, private ideas, and billing information from unauthorized access. |
| **P1** | **Unsafe LLM Prompt Injection & Manipulation** | External LLM integration exposes creators and system tools to malicious instruction overrides and unsafe content generation. |
| **P1** | **Fragmented Asset & Content Storage** | Storing drafts, metadata, and uploaded media files across disjointed third-party platforms creates workflow friction and asset loss. |
| **P2** | **Unclear Monetization & Tiered Feature Access** | Creators need transparent pricing tiers (Free vs. Pro) and instant, reliable subscription billing to access advanced features. |
| **P2** | **Lack of Administrative Platform Visibility** | Platform operators need aggregated usage analytics to monitor user growth, AI utilization, and content trends without degrading user performance. |

---

### 19.2 Problem-to-Feature Mapping

Every identified creator problem maps directly to concrete features and codebase artifacts:

#### Problem 1: Ideation & Content Generation Bottlenecks
- **PRD Requirement**: Integrate Google Gemini LLM for automated text generation, captions, rewriting, summarizing, and interactive AI tool chat (Section 8 & 11).
- **Implemented Feature**: Gemini AI Content Generation & Tool Assistant (`/api/ai/generate`, `/api/ai/chat`, `/api/ai/captions`).
- **Implementation Evidence**:
  - Frontend: `src/pages/AIAssistantPage.tsx`, `src/pages/ContentFormPage.tsx`
  - Backend Controller: `server/controllers/aiController.ts` (`handleGenerateContent`, `handleAssistantToolChat`)
  - Backend Service: `server/services/geminiService.ts`, `server/services/geminiTools.ts`
  - Model: `server/models/AIRequest.ts`

#### Problem 2: Insecure Access & Profile Management
- **PRD Requirement**: Secure user registration, password hashing, JWT session management, and Role-Based Access Control (`USER` vs `ADMIN`) (Section 8 & 10).
- **Implemented Feature**: JWT Authentication & RBAC Middleware (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
- **Implementation Evidence**:
  - Frontend: `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`, `src/pages/ProfilePage.tsx`
  - Backend Middleware & Controller: `server/middleware/authMiddleware.ts` (`protect`, `authorize`), `server/controllers/authController.ts`
  - Model & Validator: `server/models/User.ts`, `server/validators/authValidator.ts`

#### Problem 3: Unsafe LLM Prompt Injection & Manipulation
- **PRD Requirement**: Detect and intercept malicious prompt injection attempts before sending prompts to external Gemini LLM APIs (Section 8 & 11).
- **Implemented Feature**: Pattern-Matching Prompt Defense & Threat Warning UI (`promptDefense.ts`).
- **Implementation Evidence**:
  - Frontend Component: `src/components/PromptInjectionWarning.tsx`
  - Backend Utility: `server/utils/promptDefense.ts` (`sanitizePrompt`, `detectPromptInjection`)
  - Audit Trail: `server/models/AIRequest.ts` (`isSuspicious`, `suspiciousReason`)
  - Unit Test: `server/tests/unit/promptDefense.test.ts`

#### Problem 4: Fragmented Asset & Content Storage
- **PRD Requirement**: Provide a unified dashboard for full CRUD content management and multipart media file uploads (Section 8 & 12).
- **Implemented Feature**: Centralized Content CRUD & Multer Media Upload Gateway (`/api/content`, `/api/media/upload`).
- **Implementation Evidence**:
  - Frontend: `src/pages/ContentFormPage.tsx`, `src/pages/ContentListPage.tsx`, `src/pages/DashboardPage.tsx`
  - Backend Controllers: `server/controllers/contentController.ts`, `server/controllers/mediaController.ts`
  - Models: `server/models/Content.ts`, `server/models/Media.ts`

#### Problem 5: Unclear Monetization & Tiered Feature Access
- **PRD Requirement**: Support multi-tier plans (Free, Pro) with atomic payment processing and transactional database integrity (Section 8 & 12).
- **Implemented Feature**: PostgreSQL & Prisma ORM Billing Engine (`/api/billing/plans`, `/api/billing/subscribe`).
- **Implementation Evidence**:
  - Backend Controller & Service: `server/controllers/billingController.ts`, `server/services/billingService.ts` (`$transaction`)
  - Relational Schema: `prisma/schema.prisma` (`Plan`, `Subscription`, `Payment`)
  - API Integration Test: `server/tests/api/billing.test.ts`

#### Problem 6: Lack of Administrative Platform Visibility
- **PRD Requirement**: Provide platform administrators with aggregated usage analytics and role-restricted dashboard controls (Section 8 & 10).
- **Implemented Feature**: Admin Dashboard & Aggregation Pipeline (`/api/admin/stats`).
- **Implementation Evidence**:
  - Frontend: `src/pages/AdminPage.tsx`
  - Backend Controller: `server/controllers/adminController.ts` (MongoDB `$facet`, `$group` aggregation pipelines)
  - API Integration Test: `server/tests/api/admin.test.ts`

---

### 19.3 Prioritization Rationale

Feature prioritization was established based on impact on the core creator workflow:

| Problem | Priority | Rationale | Feature Implemented |
|:---|:---:|:---|:---|
| **Ideation & Content Bottlenecks** | **P0** | Directly resolves the primary friction point (writer's block) for digital creators. | AI Content Generation & Tool Assistant |
| **Insecure Access & Profile Safety** | **P0** | Non-negotiable security prerequisite to protect user identity and proprietary draft data. | JWT Authentication & RBAC Middleware |
| **Prompt Injection Protection** | **P1** | Critical security layer that prevents LLM abuse, system prompt overrides, and cost inflation. | Prompt Defense Utility & Alert UI |
| **Fragmented Asset Storage** | **P1** | Core operational requirement allowing creators to draft, store, organize, and publish content in one place. | Centralized Content CRUD & Media Uploads |
| **Tiered Monetization & Billing** | **P2** | Supporting business capability allowing upgrade paths without blocking core free drafting tools. | PostgreSQL / Prisma Transactional Billing |
| **Administrative Visibility** | **P2** | Supporting operations view for system managers, separated from creator workflows via RBAC. | Admin Dashboard & Aggregation Analytics |

---

### 19.4 Metrics and Success Criteria

To evaluate implementation effectiveness without fabricating unmeasured data, measurable **Success Criteria** are linked directly to empirical codebase verification artifacts:

| Problem | Feature | Metric / Success Criterion | Verification Evidence |
|:---|:---|:---|:---|
| **Ideation Bottlenecks** | AI Generation | Successful HTTP 200 payload delivery with populated text drafts or function response; graceful handling of API timeouts. | `server/controllers/aiController.ts`, `server/services/geminiService.ts` |
| **Insecure Access** | JWT Auth & RBAC | 100% rejection rate (HTTP 401/403) for unauthenticated or unauthorized route access; `bcrypt` hash verification on login. | `server/tests/api/auth.test.ts`, `server/middleware/authMiddleware.ts` |
| **Prompt Injection** | Prompt Defense | HTTP 400 rejection or `isSuspicious: true` flag upon detecting override strings (e.g. `"ignore previous instructions"`). | `server/tests/unit/promptDefense.test.ts`, `server/utils/promptDefense.ts` |
| **Fragmented Storage** | Content CRUD & Media | Full passage of Zod payload validation (`createContentSchema`), successful HTTP 201 creation, and correct MongoDB persistence. | `server/tests/api/content.test.ts`, `server/validators/contentValidator.ts` |
| **Monetization** | Prisma Billing | Atomic execution of multi-table inserts (User, Subscription, Payment); 100% transaction rollback on database fault. | `server/tests/api/billing.test.ts`, `server/services/billingService.ts` (`$transaction`) |
| **Admin Visibility** | Aggregation Stats | Correct HTTP 200 payload return containing aggregated counts (`totalUsers`, `totalContent`, `aiRequestsCount`). | `server/tests/api/admin.test.ts`, `server/controllers/adminController.ts` |
| **System Stability** | Full Suite Testing | 100% pass rate across all unit and API integration tests in Vitest test runner. | `npm test` execution (`server/tests/unit/*`, `server/tests/api/*`) |

---

### 19.5 User Feedback and Design Input Mapping

Design decisions in AI-CreatorHub were informed by documented persona requirements and creator user stories (PRD Sections 6 & 7):

| User Need / Feedback Theme | Design Decision | Implemented Feature | Evidence |
|:---|:---|:---|:---|
| **"Creative Claire" needs quick blog outlines without leaving the app** | Embedded Gemini AI modal directly in the content creation form so draft outputs copy straight into the editor. | AI Generation UI integration in Content Form | `src/pages/ContentFormPage.tsx` |
| **Creators worry about AI tools executing unintended server actions** | Implemented strict JSON Schema tool registration (`geminiTools.ts`) ensuring the LLM can only invoke whitelisted internal functions. | Gemini Function Calling & Tool Definition | `server/services/geminiService.ts`, `server/services/geminiTools.ts` |
| **Creators want clear status distinction for work in progress** | Added explicit `draft` vs. `published` status state with automated `publishedAt` timestamping upon state transition. | Content Status State Management | `server/models/Content.ts`, `server/controllers/contentController.ts` |
| **"Admin Alex" needs platform usage summaries without slow page loads** | Utilized MongoDB `$facet` aggregation pipelines to compute platform metrics in a single database round-trip. | MongoDB Aggregation Pipeline | `server/controllers/adminController.ts` |
| **Creators expect instant visual feedback when input violates safety policies** | Built a dedicated warning banner component that displays sanitization alerts whenever suspicious prompts are flagged. | Prompt Injection Warning UI Component | `src/components/PromptInjectionWarning.tsx` |

---

### 19.6 Centralized Management Goal Integration

The central objective of AI-CreatorHub is to eliminate software fragmentation for digital creators. By consolidating six distinct operational domains into a unified React SPA and Express REST backend, creators no longer need separate applications for drafting, AI prompt engineering, file hosting, or plan management:

```text
                               ┌────────────────────────────────────────┐
                               │           AI-CreatorHub SPA            │
                               │   (Dashboard / Editor / AI Assistant)   │
                               └───────────────────┬────────────────────┘
                                                   │ Unified REST API
       ┌───────────────────┬───────────────────────┼───────────────────────┬───────────────────┐
       ▼                   ▼                       ▼                       ▼                   ▼
┌──────────────┐    ┌──────────────┐        ┌──────────────┐        ┌──────────────┐    ┌──────────────┐
│ Authentication│    │  AI Content  │        │   Content    │        │ Media Upload │    │ Transactional│
│  & Security  │    │  Generation  │        │  Management  │        │  & Storage   │    │   Billing    │
├──────────────┤    ├──────────────┤        ├──────────────┤        ├──────────────┤    ├──────────────┤
│ JWT / bcrypt │    │ Gemini API & │        │ MongoDB CRUD │        │ Multer File  │    │ PostgreSQL & │
│ authMiddleware│   │ promptDefense│        │   Content    │        │  Storage     │    │ Prisma Engine│
└──────────────┘    └──────────────┘        └──────────────┘        └──────────────┘    └──────────────┘
```

---

### 19.7 Requirements-to-Implementation Traceability Matrix

| Creator Problem | PRD Requirement | Priority | Implemented Feature | Code Evidence | Metric / Success Criterion |
|:---|:---|:---:|:---|:---|:---|
| Content Bottlenecks | Section 8 & 11: AI Content Generation | **P0** | Gemini Generation & Tool Assistant | `src/pages/AIAssistantPage.tsx`<br>`server/controllers/aiController.ts`<br>`server/services/geminiService.ts` | HTTP 200 draft delivery; AI audit log created in `AIRequest` |
| Insecure Access | Section 8 & 10: Auth & RBAC | **P0** | JWT Auth & Role Authorization | `src/pages/LoginPage.tsx`<br>`server/controllers/authController.ts`<br>`server/middleware/authMiddleware.ts` | HTTP 401/403 rejection on invalid token (`auth.test.ts`) |
| Unsafe Prompts | Section 8 & 11: Prompt Defense | **P1** | Regex Defense & Warning UI | `src/components/PromptInjectionWarning.tsx`<br>`server/utils/promptDefense.ts` | HTTP 400 error on malicious prompt string (`promptDefense.test.ts`) |
| Fragmented Storage | Section 8 & 12: Content CRUD & Media | **P1** | MongoDB Content CRUD & Multer Gateway | `src/pages/ContentFormPage.tsx`<br>`server/controllers/contentController.ts`<br>`server/controllers/mediaController.ts` | HTTP 201 creation; Zod validation schema passing (`content.test.ts`) |
| Monetization | Section 8 & 12: Billing & Plans | **P2** | PostgreSQL Prisma Subscription Engine | `server/controllers/billingController.ts`<br>`server/services/billingService.ts`<br>`prisma/schema.prisma` | Atomic `$transaction` execution & rollback (`billing.test.ts`) |
| Admin Visibility | Section 8 & 5: Admin Analytics | **P2** | MongoDB Aggregation Dashboard | `src/pages/AdminPage.tsx`<br>`server/controllers/adminController.ts` | HTTP 200 aggregated stats return (`admin.test.ts`) |

---

### 19.8 Problem Modeling — Viva Summary

When presenting the **Problem Modeling** implementation during a technical viva examination, highlight the following key points:

1. **Concrete Creator Problems**: AI-CreatorHub addresses real operational friction faced by digital creators: writer's block, fragmented tools (separate apps for AI, drafting, media storage), security risks, and prompt injection threats.
2. **Prioritization Framework**: Requirements were strictly prioritized based on core workflow impact:
   - **P0**: Core creation and security (`feat/content-generation`, `feat/authentication`).
   - **P1**: Workflow safety and asset consolidation (`feat/prompt-injection-protection`, content CRUD).
   - **P2**: Supporting capabilities (`feat/subscription-billing`, `feat/admin-analytics`).
3. **Traceability to Code**: Every PRD requirement maps to explicit frontend pages and backend modules—such as `geminiService.ts` for AI generation, `promptDefense.ts` for sanitization, `authMiddleware.ts` for JWT RBAC, and `billingService.ts` for Prisma transactions.
4. **Centralized Management Solution**: The system eliminates application fragmentation by unifying AI assistance, drafting, media uploads, and subscription management into a single React SPA dashboard backed by Express REST APIs.
5. **Empirical Verification & Metrics**: Requirements are validated through automated success criteria in Vitest test suites (`auth.test.ts`, `content.test.ts`, `billing.test.ts`, `promptDefense.test.ts`), verifying HTTP status codes, Zod payload validation, and Prisma transaction rollbacks.
6. **User-Centric Design**: Design decisions respond directly to documented user personas (e.g., "Creative Claire" needing inline AI drafting in `ContentFormPage.tsx` and "Admin Alex" needing single-query analytics via MongoDB aggregation pipelines in `adminController.ts`).
