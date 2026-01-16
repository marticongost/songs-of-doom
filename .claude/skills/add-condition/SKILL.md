---
name: add-condition
description: Create TypeScript types and Svelte components to represent a condition that must be satisfied in order for a card effect to be triggered.
---

# Add a new condition

## When to use this skill

Use this skill when the user needs to define or modify a type of condition that can
determine wheter a given card effect should be triggered.

## Tasks

1. Add a new TypeScript file in `src/lib/catalog/models/conditions`, exporting:
   - An interface that extends from `ConditionProps`, with the properties described by the user
   - A class that extends from `Condition`, with the properties described by the user (read-only)
   - Add JSDoc comments to all types and fields, explaining the in-game effects.
2. Barrel-export the new type from `src/lib/catalog/models/conditions/index.ts`
3. Add a new `<effect-name>ConditionChip` Svelte component in `src/lib/components/conditions`:
   - Pass it a `condition` prop of the newly declared type
4. Modify the ConditionChip component:
   - Import the effect class and the effect chip component at the top of the file
   - Add a branch for the new effect type, using its new Chip component for rendering
