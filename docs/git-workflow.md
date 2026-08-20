# Git Workflow

The **AI-CreatorHub** platform uses a structured, branch-based Git workflow to manage development. All new features, bug fixes, test implementations, and documentation updates are developed in isolated feature branches rather than committing directly to the primary `main` branch.

Directly pushing commits to `main` increases the risk of introducing unstable code into production, breaking existing REST API contracts, or disrupting concurrent development. By isolating changes in dedicated branches, code can be thoroughly developed, tested via Vitest/Supertest, reviewed through Pull Requests, and integrated safely into the stable codebase.

The standard workflow lifecycle proceeds as follows:

```text
main
↓
feature branch
↓
development
↓
focused commits
↓
push
↓
Pull Request
↓
review
↓
conflict resolution if required
↓
merge
↓
main
```

---

# Branch Management

Branches in AI-CreatorHub are organized around individual, logical units of functionality. Each branch name begins with a category prefix (`feat/`, `fix/`, `test/`, `docs/`) followed by a concise hyphenated description of the feature or issue being addressed.

Below are the primary project-specific branches used across the codebase and the scope of work associated with each:

### `feat/content-generation`
- Implementation of Gemini LLM content generation pipelines in `server/services/geminiService.ts` and `server/controllers/aiController.ts` (`handleGenerateContent`).
- Content drafting and management UI integration in `src/pages/ContentFormPage.tsx` and `src/pages/ContentListPage.tsx`.
- MongoDB document model integrations for `Content` (`server/models/Content.ts`) and AI audit tracking (`server/models/AIRequest.ts`).
- Associated API integration tests in `server/tests/api/content.test.ts`.

### `feat/ai-assistant`
- Interactive AI chat assistant powered by Google Gemini with tool calling / function use (`server/services/geminiTools.ts`).
- Conversational chat UI implementation in `src/pages/AIAssistantPage.tsx`.
- Real-time tool execution logic for querying server metrics and platform content statistics.

### `feat/authentication`
- User registration, login, and profile management in `server/controllers/authController.ts` and `src/pages/LoginPage.tsx` / `src/pages/RegisterPage.tsx`.
- JSON Web Token (JWT) generation, signing, and Bearer token extraction in `server/middleware/authMiddleware.ts`.
- Password hashing using `bcrypt` and role-based access control (RBAC) supporting `USER` and `ADMIN` roles.
- Authentication API integration tests in `server/tests/api/auth.test.ts`.

### `feat/subscription-billing`
- Multi-tier subscription model (Free, Pro) and billing operations.
- Relational schema management in PostgreSQL using Prisma ORM (`prisma/schema.prisma`).
- Atomic subscription creation and simulated payment processing via Prisma `$transaction` in `server/services/billingService.ts` and `server/controllers/billingController.ts`.
- Automated transaction rollback and billing API tests in `server/tests/api/billing.test.ts`.

### `feat/prompt-injection-protection`
- Pattern-matching defense mechanism in `server/utils/promptDefense.ts` for detecting instruction override attempts in LLM prompts.
- User-facing threat alert component `src/components/PromptInjectionWarning.tsx`.
- Flagging and logging suspicious prompts in the `AIRequest` collection.
- Unit testing of security regex rules in `server/tests/unit/promptDefense.test.ts`.

### `fix/content-validation`
- Refactoring and updating Zod schema definitions in `server/validators/contentValidator.ts` and `server/validators/aiValidator.ts`.
- Handling edge cases in HTTP request payload validation to ensure 400 Bad Request responses with detailed error structures.

### `test/user-model`
- Expanding unit test coverage for Mongoose schema methods, index constraints, and password hashing in `server/tests/unit/userModel.test.ts`.
- Vitest test environment isolation using `mongodb-memory-server`.

### `docs/project-documentation`
- Maintaining architecture specifications, API contracts, and guides across project documentation files (`PRD.md`, `HLD.md`, `LLD.md`, `README.md`, and `docs/contributing.md`).

---

# Commit Message Convention

AI-CreatorHub enforces a strict Conventional Commits standard. Commit messages must be descriptive, concise, and prefixed with a type indicator that summarizes the nature of the change.

### Conventional Commit Syntax
```text
<type>: <short summary in imperative present tense>
```

### Prefix Definitions
- **`feat:`**: Introduces a new feature to the platform (e.g., new API endpoints, UI pages, database schemas, or LLM capabilities).
- **`fix:`**: Patches a bug or resolves unexpected behavior in existing code.
- **`test:`**: Adds new test cases or refactor existing test suites without changing application functionality.
- **`docs:`**: Modifies documentation files such as Markdown documents or internal code docstrings.
- **`refactor:`**: Alters internal code structure without adding new features or fixing bugs (e.g., simplifying middleware logic).
- **`chore:`**: Tasks related to project build configuration, dependency management (`package.json`), or environment setup.

### Project-Specific Commit Examples
- `feat: add AI content generation`
- `feat: implement subscription billing`
- `feat: add prompt injection protection`
- `fix: validate content generation input`
- `fix: handle authentication failure`
- `test: add user model tests`
- `docs: update project documentation`
- `refactor: simplify authentication middleware`

### Importance of Descriptive Commit Messages
Clear commit messages are essential for maintaining repository integrity and developer productivity:
1. **Traceability**: Enables developers to understand *why* a change was made when inspecting `git log` or running `git blame`.
2. **Efficient Debugging**: Simplifies pinpointing when regression bugs were introduced using tools like `git bisect`.
3. **Streamlined Code Reviews**: Helps reviewers understand the exact intent of each individual commit within a Pull Request.
4. **Automated Changelogs**: Facilitates automatic generation of release notes based on commit message prefixes.

---

# Pull Request Workflow

All code contributions must pass through a formal Pull Request (PR) process before integration into the `main` branch. Pushing directly to `main` is restricted to preserve software stability.

### The 11-Step Pull Request Process

1. **Create a Feature Branch**: Branch off from the latest, updated `main` branch.
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/content-generation
   ```
2. **Develop the Feature**: Implement changes in the codebase adhering to project standards and TypeScript definitions.
3. **Make Focused Commits**: Group logical changes into atomic commits with conventional commit messages.
   ```bash
   git add server/controllers/aiController.ts server/services/geminiService.ts
   git commit -m "feat: add AI content generation"
   ```
4. **Push the Branch**: Upload the feature branch to the remote repository (`origin`).
   ```bash
   git push -u origin feat/content-generation
   ```
5. **Open a Pull Request**: Navigate to the repository on GitHub and open a PR targeting `main` from `feat/content-generation`.
6. **Review Files Changed**: Perform a thorough self-review in the GitHub UI, checking line-by-line diffs to ensure no unintended files or debug statements are included.
7. **Run Tests & Automated Checks**: Ensure all automated checks pass locally and in CI:
   - Run type checking: `npm run lint`
   - Run unit and integration tests: `npm test`
8. **Address Review Issues**: Incorporate feedback provided by reviewers by committing and pushing changes to the open feature branch.
9. **Resolve Conflicts**: If `main` has advanced and conflicts exist, merge `main` into the feature branch and resolve markers.
10. **Merge the Pull Request**: Once approved and checks pass, merge the PR into `main` using a merge commit.
11. **Delete the Feature Branch**: Clean up remote and local feature branches post-merge to maintain repository hygiene.
    ```bash
    git checkout main
    git pull origin main
    git branch -d feat/content-generation
    ```

### Why Pull Requests are Essential
Direct commits to `main` bypass code reviews and quality verification, leading to broken builds, unhandled exceptions, and schema mismatches between MongoDB and PostgreSQL. PRs provide an essential review boundary, ensuring code compliance, proper error handling, security checks (Prompt Injection rules), and complete test coverage prior to integration.

---

# Merge Commits

When a Pull Request is merged into `main`, Git creates a **Merge Commit** if the history has diverged. This merge commit acts as an integration milestone that connects the history of the feature branch to `main`.

### Merge Commit Examples

```text
Merge Pull Request #5 from Yashraj191007/feat/content-generation → main
```

```text
Merge Pull Request #6 from Yashraj191007/feat/authentication → main
```

### Structure of a Merge Commit
A merge commit has two parent commits:
1. The previous tip of the `main` branch.
2. The latest commit on the feature branch (`feat/content-generation`).

### Tracing Feature Lifecycle
Merge commits preserve complete historical context, allowing developers to trace the full lifecycle of a feature across five distinct stages:

```text
branch (feat/content-generation)
   ↓
commits (feat: add AI content generation)
   ↓
Pull Request (#5)
   ↓
merge (Merge pull request #5...)
   ↓
main (Production Branch)
```

By preserving merge commits, team members can revert an entire feature safely by reverting the single merge commit if critical issues arise in production.

---

# Merge Conflict Handling

A merge conflict occurs when Git cannot automatically reconcile differences between two branches. This happens when `main` and a feature branch (e.g., `feat/content-generation`) have edited overlapping lines in the same file.

### Synchronizing a Feature Branch with `main`

If changes were merged into `main` while `feat/content-generation` was being developed, the feature branch must be synchronized with `main`:

```bash
git checkout main
git pull origin main
git checkout feat/content-generation
git merge main
```

If Git detects overlapping modifications in files like `server/controllers/contentController.ts`, it stops the merge and flags the files as conflicted.

### The Conflict Resolution Process

1. **Check Status**: Run `git status` to identify all unmerged paths.
   ```bash
   git status
   ```
2. **Locate Conflicted Files**: Identify files marked as `both modified` (e.g., `server/controllers/contentController.ts`).
3. **Open Conflicted Files**: Open the files in an editor and search for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
4. **Compare Branch Changes**: Analyze the code between `<<<<<<< HEAD` (current branch changes) and `>>>>>>> main` (incoming changes from main).
5. **Reconcile Changes**: Determine which implementation to retain or combine both implementations logically.
6. **Remove Conflict Markers**: Delete the marker lines (`<<<<<<<`, `=======`, `>>>>>>>`) from the file.
7. **Run Tests**: Verify that the resolved code compiles cleanly and passes all test suites:
   ```bash
   npm run lint
   npm test
   ```
8. **Stage Resolved Files**: Mark the conflicts as resolved in Git index:
   ```bash
   git add server/controllers/contentController.ts
   ```
9. **Commit the Resolution**: Complete the merge commit with a clear message:
   ```bash
   git commit -m "fix: resolve merge conflicts with main in contentController"
   ```
10. **Push Updated Branch**: Push the resolution to the remote feature branch:
    ```bash
    git push origin feat/content-generation
    ```
11. **Continue Pull Request**: Return to the GitHub PR interface; the conflict banner will update to show all conflicts resolved.

---

### Detailed Merge Conflict Example

Suppose both `main` and `feat/content-generation` modified `server/controllers/contentController.ts` around `createContent`.

#### Unresolved File (`server/controllers/contentController.ts`)
```typescript
<<<<<<< HEAD
    // Changes in feat/content-generation
    const content = await Content.create({
      ...validated,
      userId,
      publishedAt: validated.status === 'published' ? new Date() : undefined,
    });
=======
    // Changes merged into main
    const content = await Content.create({
      ...validated,
      userId,
      sanitizedTitle: validated.title.trim(),
      publishedAt: validated.status === 'published' ? new Date() : undefined,
    });
>>>>>>> main
```

#### Understanding the Conflict
- **HEAD (Feature Branch)**: Created content with `userId` and conditional `publishedAt`.
- **main Branch**: Added title trimming (`sanitizedTitle: validated.title.trim()`).

#### Resolved File (`server/controllers/contentController.ts`)
Resolving the conflict requires combining both features so neither feature is lost:

```typescript
    // Resolved implementation preserving both features
    const content = await Content.create({
      ...validated,
      userId,
      sanitizedTitle: validated.title.trim(),
      publishedAt: validated.status === 'published' ? new Date() : undefined,
    });
```

> **CRITICAL RULE**: Merge conflicts must **never** be resolved by blindly choosing one side or deleting code without understanding its purpose. Developers must inspect both logic paths, ensure database constraint compliance, verify Zod schema compatibility, and run `npm test` before committing the resolution.

---

# Keeping a Clean History

Maintaining a clean and linear Git history is vital for large full-stack projects like AI-CreatorHub. The following project guidelines must be followed by all contributors:

1. **Use Isolated Feature Branches**: Perform all development in dedicated branches instead of `main`.
2. **Scope Branches to One Feature**: Keep feature branches narrow. Do not mix unrelated tasks (e.g., auth middleware refactoring and Gemini prompt updates in the same branch).
3. **Create Focused Commits**: Write small, logically grouped commits representing single working steps.
4. **Use Conventional Commit Messages**: Prefix commit messages with standard indicators (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`).
5. **Avoid Mixed Changes**: Keep formatting changes or code cleanup separate from feature implementations.
6. **Self-Review PR Diffs**: Inspect PR diffs in GitHub before requesting review to eliminate extraneous logs, temporary test files, or accidental edits.
7. **Sync with Main Early**: Merge `main` into working feature branches frequently to catch and resolve conflicts early.
8. **Run Automated Tests**: Verify system stability with `npm test` and `npm run lint` prior to merging.
9. **Never Commit Secrets**: Do not commit sensitive credentials (such as `GEMINI_API_KEY`, `JWT_SECRET`, or database URI strings). Ensure `.env` remains in `.gitignore`.
10. **Exclude Build & Temp Artifacts**: Prevent committing generated files like `node_modules/`, `dist/`, or media binaries in `uploads/`.
11. **Protect Main Branch**: Keep `main` locked so that code can only be integrated via passing Pull Requests.
12. **Delete Obsolete Branches**: Delete feature branches immediately after successful merging to prevent clutter.

---

# Complete Project Example

The following end-to-end example demonstrates the full development cycle for the `feat/content-generation` branch.

### Step 1: Update local `main` and create feature branch
```bash
git checkout main
git pull origin main
git checkout -b feat/content-generation
```

### Step 2: Implement Gemini content generation feature
Modify the following project files:
- `server/controllers/aiController.ts` (implement `handleGenerateContent`)
- `server/services/geminiService.ts` (add `generateContentDraft`)
- `src/pages/ContentFormPage.tsx` (add AI content generation trigger button)

### Step 3: Stage and commit changes with conventional commit messages
```bash
git status
git add server/controllers/aiController.ts server/services/geminiService.ts
git commit -m "feat: add AI content generation"

git add src/pages/ContentFormPage.tsx
git commit -m "feat: integrate AI generation button in content form UI"
```

### Step 4: Push branch to remote repository
```bash
git push -u origin feat/content-generation
```

### Step 5: Open Pull Request
Navigate to GitHub and create a PR from `feat/content-generation` into `main` with title `"feat: implement Gemini AI content generation"`.

### Step 6: Perform PR diff self-review and run local checks
```bash
npm run lint
npm test
```

### Step 7: Synchronize and resolve conflicts if main updated
```bash
git checkout main
git pull origin main
git checkout feat/content-generation
git merge main

# If conflict occurs in server/controllers/aiController.ts:
# Open file, resolve conflict markers, test, then stage and commit:
git add server/controllers/aiController.ts
git commit -m "fix: resolve merge conflicts with main in aiController"
git push origin feat/content-generation
```

### Step 8: Merge PR and clean up local branch
After PR approval on GitHub:
```bash
git checkout main
git pull origin main
git branch -d feat/content-generation
```

---

# Viva Summary

Key concepts to summarize verbally during project presentation:

- **Work Isolation**: Feature branches (`feat/*`, `fix/*`) isolate development from `main` to prevent unstable commits from breaking production.
- **Descriptive Naming**: Branch names explicitly reflect the target capability or component (e.g., `feat/content-generation`, `feat/subscription-billing`).
- **Atomic Commits**: Commits represent logical, single-purpose changes rather than bulk code dumps.
- **Conventional Commits**: Commit prefixes (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`) make repository history structured and readable.
- **Pull Requests as Quality Gates**: PRs serve as mandatory code review and automated testing boundaries before integrating changes into `main`.
- **Merge Commits as Milestones**: Merge commits connect feature branch history to `main` and mark explicit feature integration points.
- **Manual Conflict Resolution**: Merge conflicts occur when overlapping code is edited; they must be resolved manually by combining logic, running tests, committing, and pushing.
- **Clean Repository Maintenance**: Restricting branches to single features, removing merged branches, and excluding secrets/build artifacts maintains a clean, maintainable codebase history.
