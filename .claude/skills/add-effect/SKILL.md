---
name: add-effect
description: Create TypeScript types and Svelte components to represent one of the possible effects from a card in the game.
---

# Add a new effect

## When to use this skill

Use this skill when the user needs to add a new type of effect that can be added to one of the cards of the game.

## Tasks

1. Add a new TypeScript file in `src/lib/catalog/models/effects`, exporting:
   - An interface that extends from EffectProps, with the properties described by the user
   - A class that extends from Effect, with the properties described by the user (read-only)
   - Add JSDoc comments to all types and fields, explaining the in-game effects.
2. Barrel-export the new type from `src/lib/catalog/models/effects/index.ts`
3. Add a new `<effect-name>EffectChip` Svelte component in `src/lib/components/effects`:
   - Pass it an `effect` prop of the newly declared type
4. Modify the EffectChip component:
   - Import the effect class and the effect chip component at the top of the file
   - Add a branch for the new effect type, using its new Chip component for rendering
