# Node.js Design Patterns

Hands-on implementations of Node.js design patterns and idioms, organized by chapter.
A working reference I build and revisit while sharpening backend fundamentals — creational,
structural, and behavioral patterns, async control flow, streams, and messaging/integration
patterns applied in real Node.js + TypeScript.

## 🤖 Built AI-first

I develop this repo **AI-first**, using **Claude Code** as part of the workflow. The repo
includes a [`CLAUDE.md`](./CLAUDE.md) that documents the conventions and guardrails the
assistant follows here — the same practice I use on production codebases: let AI accelerate
generation and refactoring while keeping architectural authority and review over what lands.

## Tech

- **Node.js** + **TypeScript**
- **ESLint** + **Prettier** for consistent style
- **Docker** for a reproducible run environment

## Structure

Examples are grouped by chapter, each folder focused on a set of patterns:

```
chapter-03/  →  ...
chapter-04/  →  ...
...
chapter-13/  →  ...
```

Each folder is self-contained and runnable on its own.

## Getting started

```bash
# clone
git clone https://github.com/Francisco-BT/node-js-design-patterns.git
cd node-js-design-patterns

# install
npm install

# run an example
npx ts-node chapter-03/<example>.ts
```

Or with Docker:

```bash
docker build -t node-design-patterns .
docker run --rm node-design-patterns
```

## Why this repo

Design patterns are most useful when you've implemented them yourself, not just read about
them. This is my sandbox for exactly that — small, focused, runnable examples I can reach for
when applying the same ideas at scale.

---

<sub>Maintained by [Francisco Bernabe](https://fbtcode.com)</sub>
