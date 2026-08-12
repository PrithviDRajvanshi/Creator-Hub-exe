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
