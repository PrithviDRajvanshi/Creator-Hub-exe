# AI CreatorHub

AI CreatorHub is a full-stack, AI-powered content management platform designed for modern creators. It enables users to generate, manage, and optimize their content seamlessly using Google's advanced Gemini AI. The platform features robust authentication, an administrative dashboard, secure AI interactions, and comprehensive testing infrastructure.

---

## 🌟 Features

- **AI Content Generation**: Leverages Google Gemini API for intelligent text generation, assisted writing, and creative ideation.
- **Robust Security & Prompt Defense**: Built-in mechanisms to detect and block prompt injection attempts, ensuring safe interactions with the LLM.
- **Secure Authentication**: End-to-end JWT-based authentication with secure password hashing (bcrypt).
- **Role-Based Access Control (RBAC)**: Distinct permissions for standard users and administrators, including a secure Admin portal.
- **Content Management**: Create, read, update, and delete (CRUD) operations for creative content with seamless MongoDB integration.
- **Responsive UI**: A modern, mobile-friendly interface built with React, Tailwind CSS, and Framer Motion.
- **Comprehensive Testing**: Automated unit and API integration testing suite ensuring platform stability.

---

## 🛠️ Technology Stack

**Frontend**
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- React Router DOM
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB & Mongoose
- Google Gemini API (`@google/genai`)
- JWT & bcryptjs
- Zod (Input Validation)
- Helmet & Express Rate Limit (Security)

**Testing**
- Vitest
- Supertest
- MongoDB Memory Server

---

## 📐 Architecture Overview

The application follows a traditional MERN-stack pattern augmented with AI capabilities:
- **Frontend**: A React SPA (Single Page Application) built with Vite. It handles routing, state management, and user interactions.
- **Backend**: An Express.js REST API providing secure endpoints for authentication, content management, media uploads, and AI processing.
- **Database**: MongoDB serves as the primary data store, utilizing Mongoose for schema validation, aggregation, and querying.
- **AI Layer**: Integrates with the Google Gemini API to process prompts and return generative content, mediated by strict backend prompt-defense sanitization.

---

## 📁 Project Structure

```text
ai-creatorhub/
├── src/                 # Frontend React application
│   ├── components/      # Reusable UI components
│   ├── context/         # React Context (Auth)
│   ├── pages/           # Route views (Dashboard, AI Assistant, etc.)
│   └── services/        # API client configuration
├── server/              # Backend Express application
│   ├── controllers/     # Route business logic
│   ├── middleware/      # Auth, security, and error handlers
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # API route definitions
│   ├── services/        # External services (Gemini AI tools)
│   ├── tests/           # Unit and API integration tests
│   ├── utils/           # Helper functions (Prompt Defense)
│   └── validators/      # Zod validation schemas
├── uploads/             # Media upload directory
├── server.ts            # Backend application entry point
├── package.json         # Project dependencies & scripts
└── .env                 # Environment configuration (ignored in Git)
```

---

## ⚙️ Environment Variables & Secrets Management

To configure your local environment or production deployment:

1. **Copy the example template:**
   ```bash
   cp .env.example .env
   ```
2. **Fill in your secret values** in `.env`:
   - `GEMINI_API_KEY`: Required for Google Gemini AI generation features.
   - `JWT_SECRET`: Secret key used for signing authentication JSON Web Tokens.
   - `JWT_EXPIRES_IN`: Token validity period (e.g. `7d`).
   - `MONGODB_URI`: MongoDB connection string (falls back to embedded database if omitted).
   - `PORT`: Server port (defaults to `3000`).

```env
# Google Gemini API Key (Required for AI generation)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application Settings
APP_URL="http://localhost:3000"
PORT=3000
NODE_ENV="development"

# MongoDB Connection String (System auto-starts an embedded DB if omitted)
MONGODB_URI="mongodb://localhost:27017/aicreatorhub"

# JWT Authentication Config
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"
```

> **🛡️ Security Guidelines & Secrets Management:**
> - **Environment Variable Isolation**: `JWT_SECRET` and API keys are sensitive configuration secrets. Production deployments receive these credentials strictly through environment variables.
> - **Git Exclusion**: `.env` is excluded via `.gitignore`, while `.env.example` documents required variable names using safe placeholders (`JWT_SECRET="your_jwt_secret_key_here"`).
> - **Development Fallback vs. Production Fail-Fast**: A fallback secret exists strictly for local development convenience (`NODE_ENV !== 'production'`). In production (`NODE_ENV === 'production'`), the server strictly enforces fail-fast validation: if `JWT_SECRET` is missing or set to a placeholder, the application halts immediately with a fatal configuration error rather than falling back to a default secret.
> - **Preventing Token Forgery**: A static or hard-coded fallback in production would allow any attacker with repository access to forge valid JWTs and impersonate users. Enforcing unique secrets per deployment mitigates token forgery risks.
> - **Secret Rotation**: Rotating `JWT_SECRET` automatically invalidates all existing user session tokens signed with the previous key, so secret rotation should be managed deliberately.

---

## 🚀 Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Yashraj191007/AI-CreatorHub.git
   cd AI-CreatorHub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   - Create a `.env` file using the configuration detailed above.

---

## 💻 Development Commands

Start the full-stack development server (Frontend and Backend concurrently):

```bash
npm run dev
```
*The app will typically be available at `http://localhost:3000` (or as defined by your PORT).*

---

## 🧪 Testing

We use Vitest and Supertest for our automated testing suite. 

**Run the complete test suite (Unit & Integration):**
```bash
npm test
```

**Run tests in watch mode (for active development):**
```bash
npm run test:watch
```

---

## 🔎 TypeScript Checking

To run the TypeScript compiler and check for type errors without emitting built files:

```bash
npm run lint
```

---

## 🛡️ Security Notes

- **Prompt Injection Defense**: All AI prompts pass through a strict sanitization layer (`server/utils/promptDefense.ts`) to prevent system instruction overrides.
- **Authentication**: Passwords are one-way hashed using `bcrypt` before storage. Sessions are managed via HttpOnly/Bearer JSON Web Tokens.
- **Rate Limiting**: Applied to sensitive routes (Auth, AI Generation) to prevent brute force and DoS attacks.
- **Data Validation**: Request bodies are strictly validated against `Zod` schemas before hitting the controllers.

---

## 🌿 Git Workflow

This project follows a standard feature-branch Git workflow:
- `main`: Contains production-ready, stable code.
- `feature/*`: Branches used for developing new features (e.g., `feature/testing-setup`).

---

## 🎓 Kalvium Concepts Implemented

This project demonstrates proficiency in several core full-stack concepts:
- **LLM API Integration**: Direct integration with Gemini API, including function calling and prompt engineering.
- **Authentication & Security**: Complete implementation of JWT, RBAC, input sanitization, and rate limiting.
- **Backend Architecture**: RESTful API design using Express middleware and appropriate HTTP status codes.
- **Frontend Mastery**: Comprehensive use of React Composition, Custom Hooks (`useState`, `useEffect`), and async data fetching.
- **MongoDB Operations**: Complex CRUD operations, schema design with Mongoose, indexing, and aggregation pipelines.
- **Engineering Best Practices**: Complete test coverage via Vitest/Supertest, strict TypeScript typing, and secure environment configuration.

---

**Author**: Yashraj Jagtap
