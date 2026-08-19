# Recommended Git Workflow for Creator-Hub-exe

This document outlines the recommended Git workflow for contributing to the **Creator-Hub-exe** project. Following a structured Git workflow ensures code stability, facilitates peer code reviews, and maintains a clean history on the primary development branch (`main`).

---

## Visual Workflow Overview

```text
main → feature branch → changes → commit → push → Pull Request → review/checks → merge → main
```

---

## Recommended Workflow Steps

### 1. Why Use Feature Branches?
Directly committing to the `main` branch can introduce unstable changes into production or disrupt concurrent work. Using dedicated feature branches allows developers to:
- Work on new features, documentation, or bug fixes in complete isolation.
- Test and refine code without affecting the stable `main` codebase.
- Facilitate code reviews and automated continuous integration checks before merging.

---

### 2. Creating a Feature Branch from `main`
Before starting any work, sync your local `main` branch with the remote repository and create a new feature branch:

```bash
git checkout main
git pull origin main
git checkout -b docs/git-workflow
```

---

### 3. Making Changes and Committing
Make the required edits or additions, then stage and commit your changes with clear, meaningful commit messages using standard prefixes (e.g., `feat:`, `fix:`, `docs:`, `refactor:`, `test:`):

```bash
git status
git add docs/git-workflow.md
git commit -m "docs: add git workflow documentation"
```

---

### 4. Pushing the Feature Branch to GitHub
Publish your feature branch to the remote repository:

```bash
git push -u origin docs/git-workflow
```

---

### 5. Opening a Pull Request (PR)
1. Navigate to the project repository on GitHub: [PrithviDRajvanshi/Creator-Hub-exe](https://github.com/PrithviDRajvanshi/Creator-Hub-exe).
2. GitHub will automatically display a prompt to **Compare & pull request** for recently pushed branches.
3. Ensure the base branch is set to `main` and the compare branch is `docs/git-workflow`.
4. Provide a clear title and detailed summary of the changes in the PR description.

---

### 6. Reviewing the PR and Checking Diffs
- Inspect the **Files changed** tab to perform a self-review of line-by-line diffs.
- Ensure all CI/CD pipeline checks pass cleanly.
- Address any code review feedback or requested changes by pushing additional commits to the feature branch.

---

### 7. Merging the PR into `main`
Once all checks pass and the PR is approved:
1. Select **Merge pull request** (or **Squash and merge** according to team preference).
2. Confirm the merge.
3. Optionally delete the feature branch on GitHub after a successful merge.

---

### 8. Synchronizing Your Local Repository
After merging the PR on GitHub, update your local clone and clean up the merged feature branch:

```bash
git checkout main
git pull origin main
git branch -d docs/git-workflow
```
