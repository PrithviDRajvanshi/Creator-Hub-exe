# Contributing to AI CreatorHub

Thank you for contributing to **AI CreatorHub**! This guide provides a quick overview of how to set up the project locally, adhere to our development workflow, and submit Pull Requests effectively.

---

## Visual Workflow Overview

```text
main → feature branch → changes → test → commit → push → Pull Request → review → merge
```

---

## 1. Prerequisites

Before starting development, ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher
- **npm**: Package manager (comes with Node.js)
- **Git**: For version control

---

## 2. Project Setup

### Step 1: Install Dependencies
Clone the repository and install the project dependencies:
```bash
git clone https://github.com/PrithviDRajvanshi/Creator-Hub-exe.git
cd Creator-Hub-exe
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory. Configure your local environment using template values:

```env
# Required for AI generation
GEMINI_API_KEY="your_gemini_api_key_here"

# Application Settings
APP_URL="http://localhost:3000"
PORT=3000

# Database Connection (System auto-starts an embedded DB if omitted)
MONGODB_URI="mongodb://localhost:27017/aicreatorhub"

# JWT Authentication Config
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"
```

> **Note:** Never commit real secrets, passwords, or API keys to Git. The `.env` file is ignored in `.gitignore`.

### Step 3: Start the Development Server
Launch the development server (runs full-stack backend & Vite frontend concurrently):
```bash
npm run dev
```

---

## 3. Development Workflow

Follow this recommended process when working on any bug fix, feature, or documentation update:

1. **Start from `main`**: Ensure your local `main` branch is clean and up to date with the remote repository.
2. **Create a Feature Branch**: Create a descriptive branch (e.g., `feature/login-fix` or `docs/update-contributing`).
3. **Make Focused Changes**: Keep changes small, modular, and focused on a single topic.
4. **Verify & Test Changes**:
   - Check TypeScript types: `npm run lint`
   - Run the automated test suite: `npm test`
5. **Stage & Commit**: Write clear, descriptive commit messages matching standard conventions (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
6. **Push Branch to Remote**: Push your local branch to GitHub to make it available for review.

---

## 4. Pull Request Workflow

1. **Open a Pull Request**: Navigate to the repository on GitHub and open a PR targeting the `main` branch.
2. **Describe Changes**: Provide a clear title and description detailing what changed, why, and how to verify it.
3. **Review Diffs**: Inspect the **Files changed** tab on GitHub to verify your diffs before requesting review.
4. **Address Feedback**: Push additional commits to the feature branch to resolve code review comments or failed CI checks.
5. **Merge**: Once approved and verified, merge the PR into `main` and sync your local repository.

---

## 5. Example Git Commands

Here is the sequence of Git commands for a standard contribution cycle:

```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Create and switch to a new feature/docs branch
git checkout -b feature/add-new-feature

# 3. Check status of modified/untracked files
git status

# 4. Stage specific modified files
git add docs/contributing.md

# 5. Commit with a meaningful commit message
git commit -m "docs: add contributing guide"

# 6. Push the feature branch to GitHub
git push -u origin feature/add-new-feature
```

---

## 🛠️ Available Package Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server (`tsx server.ts`) |
| `npm run build` | Builds frontend assets via Vite & bundles server via esbuild |
| `npm run start` | Runs the production bundle from `dist/server.cjs` |
| `npm run lint` | Runs TypeScript type-checking without emitting files (`tsc --noEmit`) |
| `npm test` | Runs the Vitest test suite once |
| `npm run test:watch` | Runs Vitest tests in interactive watch mode |
