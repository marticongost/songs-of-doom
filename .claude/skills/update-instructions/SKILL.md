---
name: update-instructions
description: Update CLAUDE.md and all skill files to reflect the current state of the project.
autoInvoke: false
---

# Update agent instructions

## When to use this skill

Use this skill **only** when explicitly invoked via the `/update-instructions` slash command.
Its purpose is to bring all agent instruction files in sync with the current state of the
codebase after the project has evolved (new patterns, renamed directories, added models,
changed conventions, etc.).

## Files to update

The following files comprise the full set of agent instructions:

| File                                          | Purpose                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `CLAUDE.md`                                   | Top-level project guidance: overview, commands, architecture, conventions |
| `.claude/skills/svelte-component/SKILL.md`    | Conventions for creating/updating Svelte components                       |
| `.claude/skills/add-effect/SKILL.md`          | Steps and conventions for adding a new game effect                        |
| `.claude/skills/add-expression/SKILL.md`      | Steps and conventions for adding a new expression                         |
| `.claude/skills/update-instructions/SKILL.md` | This skill (update its file list if new skills are added)                 |

## Process

Follow these steps in order:

### 1. Determine scope from conversation context

Look at the current conversation to understand what has changed. Typical scenarios:

- **After implementing a feature**: the conversation already contains the new code, patterns,
  or files that were added or modified — use that context directly.
- **After a refactor**: the conversation shows what was renamed, moved, or restructured.
- **User provides a summary**: the user describes what changed and which instructions need updating.

If the conversation provides enough context to know what changed, proceed to step 2.

If the conversation does **not** provide enough context (e.g. the user invoked this skill
at the start of a fresh conversation without prior work), ask the user:

> What changes should the instructions reflect? For example:
>
> - A specific feature or refactor from a recent session
> - A list of areas that need updating
> - A full review of all instructions against the codebase

Only perform a broad codebase exploration if the user explicitly requests a full review.

### 2. Read the relevant instruction files

Read the instruction files that are likely affected by the changes identified in step 1.
You do not need to read every file if only a subset is relevant.

### 3. Targeted verification

For the specific areas that changed, verify the instruction files against the actual code.
Read the relevant source files to confirm the current state. For example:

- If a new effect was added, check `src/lib/catalog/models/effects/index.ts` and
  `src/lib/components/effects/EffectChip.svelte` to confirm the pattern documented in
  the add-effect skill still matches reality.
- If a component convention changed, check a few representative components.

### 4. Draft and apply updates

For each file that needs changes:

1. Identify what is outdated, missing, or incorrect
2. Edit the file to reflect the current state of the project
3. Preserve the existing tone, structure, and level of detail — do not rewrite sections
   that are already accurate
4. When adding new sections, follow the formatting conventions of the surrounding content

### 5. Verify consistency

After editing, re-read all updated files and confirm:

- Cross-references between files are correct (e.g. CLAUDE.md mentions skills that exist)
- Example code snippets match actual patterns in the codebase
- File paths referenced in instructions point to files that exist
- The Custom Skills list in CLAUDE.md includes all skills present in `.claude/skills/`
- The file list in this skill's own SKILL.md is up to date

## Important guidelines

- **Do not invent conventions.** Only document patterns that actually exist in the code.
- **Do not rewrite content that is still accurate.** Minimise churn.
- **Keep instructions concise.** Favour short, scannable sections over long prose.
- **Preserve localisation order.** Always list languages as `ca`, `es`, `en`.
- **Update examples** only when the existing example no longer compiles or reflects
  current patterns. Prefer updating an example in place over adding a new one.
