# Node.js Design Patterns - Learning Project

## About

Educational project following **"Node.js Design Patterns 4th Edition"** by Mario Casciaro and Luciano Mammino. The project implements examples and exercises from each chapter progressively.

## Critical Rule: Respect Chapter Patterns

Each chapter uses the pattern it teaches. **Do not modernize earlier chapters.**

| Chapters | Pattern to use |
|----------|---------------|
| 3-4 | Callbacks (no promises, no async/await) |
| 5+ | Promises and async/await |

## Project Structure

```
/chapter-XX/
  *.js            # Book examples
  exercises/      # Solved exercises
  util.js         # Shared utilities
```

Key files that evolve across chapters:
- `spider*.js` — Web crawler that progresses from callbacks to promises to async/await
- `TaskQueue.js` — Task queue with concurrency control
- `util.js` — Helper functions (exists, download, getPageLinks)

## Tech Stack

- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Linting**: ESLint (flat config `eslint.config.mjs`) + Prettier
- **Dependencies**: htmlparser2, mkdirp, slug
- **No test framework configured yet**

## Code Style

- Code in **English**, explanations/communication in **Spanish**
- Self-documenting code with descriptive names
- Comments only for complex/non-obvious logic
- Follow the book's style within each chapter

## When Reviewing or Writing Code

- Proactively flag: race conditions, memory leaks, unhandled errors, edge cases
- Compare patterns: show trade-offs between different approaches
- Explain the "why" behind patterns, not just the "what"
- Assume the user is a **senior developer** — skip basic explanations

## Commands

```bash
npm run lint      # ESLint with auto-fix
npm run format    # Prettier
node <file>       # Run any example
```
