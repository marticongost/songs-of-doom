---
name: generate-images
description: Orchestrate card image generation using the Gemini-powered generate-images script — find missing images, craft prompts from card data, and iteratively refine results.
---

# Generate card images

## When to use this skill

Use this skill when the user wants to generate, regenerate, or refine artwork for one or more cards. Typical triggers:

- "Generate an image for \<card\>"
- "What cards are missing images?"
- "Redo the warrior image"
- "The sword image looks wrong, make it darker"

## Setup check

All commands run from `packages/web/`. The script requires `GEMINI_API_KEY` in `.env`.
Verify it is set before proceeding — if not, tell the user and stop.

## Workflow

### 1. Find missing cards (if no specific card given)

```bash
cd packages/web && npm run generate-images -- missing
```

Present the list to the user and ask which card(s) to generate first.

### 2. Read the card data

Before writing a description, read the card's data file to understand what it does. Card data lives in `packages/game/src/data/`. For example:

- Traits/archetypes: `packages/game/src/data/archetypes/**/{id}.ts`
- Skills: `packages/game/src/data/disciplines/**/{id}.ts`
- Items: `packages/game/src/data/items/**/{id}.ts`
- Allies: `packages/game/src/data/allies/{id}.ts`
- Creatures/encounters: `packages/game/src/data/modules/**/{id}.ts`
- Campaign cards: `packages/game/src/data/campaigns/**/{id}.ts`

Use the card's **English title**, its **capabilities** (actions and effects), and its **properties** (keywords like _Engaged_, _Poisoned_) to inform the visual description. The description should convey what the card _is_ and _does_, not just its name.

### 3. Craft the description

Write a concrete, visual description suitable for a fantasy card illustrator. Include:

- **Subject**: what the central figure or scene is (character, creature, object, event)
- **Action or pose**: what is happening or the mood conveyed
- **Key visual details**: distinctive equipment, wounds, environment, lighting
- **Style cues if needed**: e.g. "close-up", "dramatic low angle", "dark forest background"

Keep it to 2–4 sentences. Avoid abstract game mechanics — translate them into imagery.

Example for `backstab`:

> "A hooded rogue lunging from the shadows, driving a long dagger into the back of an armoured opponent. The rogue's face is half-lit by a single torch, expression cold and focused. Dark stone corridor background."

### 4. Generate the image

For a new card with no prior task:

```bash
cd packages/web && npm run generate-images -- describe <card-id> "<description>"
```

If an image or task already exists and the user wants to start over:

```bash
cd packages/web && npm run generate-images -- describe <card-id> "<description>" --redo
```

### 5. Refine with amendments

If the user is unhappy with the result, collect their feedback and run:

```bash
cd packages/web && npm run generate-images -- amend <card-id> "<what to change>"
```

`amend` sends the existing image back to Gemini as a reference, so changes are applied on top of what was already generated. You can amend multiple times.

Keep amendments focused — one or two specific changes per call works better than a long list.

### 6. Check status

```bash
cd packages/web && npm run generate-images -- status
```

Use this to show the user an overview of all tasks, especially when generating several cards in sequence.

## Generating multiple cards

When generating several cards in one session:

1. Run `missing` to get the full list
2. For each card, read its data file, craft a description, and run `describe`
3. Run `status` after each batch to confirm progress
4. Address any `FAILED` tasks: read the error, adjust the description or check the API key, then retry with `--redo`

## Notes

- The generated image is saved immediately to `packages/web/src/lib/assets/img/cards/{id}.jpg` and picked up by the web app automatically — no further import step needed.
- Disciplines, modules, and campaign root nodes (`Campaign`, `Scenario`) are not expected to have images and are excluded from `missing`.
- The state file (`packages/web/scripts/.image-gen-state.json`) persists across sessions. A card's full amendment history is stored there, so `amend` always has context even after restarting.
- Use `-v` for verbose error output if a generation fails unexpectedly.
