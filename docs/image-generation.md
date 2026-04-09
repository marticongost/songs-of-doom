# Card Image Generation

The `generate-images` script generates card artwork using the Gemini API and saves it to the web package's image asset directory.

## Setup

Add your Gemini API key to `.env`:

```
GEMINI_API_KEY=your_api_key_here
```

All commands are run from `packages/web/`:

```bash
cd packages/web
npm run generate-images -- <command> [args]
```

## Commands

### `missing`

Lists all cards that are expected to have an image but don't yet. Disciplines, modules, and campaign root nodes are excluded — only entity types that appear as physical cards are checked.

```bash
npm run generate-images -- missing
```

### `describe <card-id> <description>`

Generates an image for a card. The description is sent to the Gemini API together with the configured system prompt to produce the illustration, which is saved as `src/lib/assets/img/cards/{card-id}.jpg`.

```bash
npm run generate-images -- describe warrior "A battle-hardened fighter in heavy plate armor, scarred face, holding a longsword"
```

If an image or a prior task already exists for the card, the command errors out. Pass `--redo` to overwrite:

```bash
npm run generate-images -- describe warrior "..." --redo
```

### `amend <card-id> <amendment>`

Refines a previously generated image. The amendment is appended to the task's history and the image is regenerated.

```bash
npm run generate-images -- amend warrior "Make the armor darker and more worn, add a torn cape"
```

When an existing image is on disk, it is sent back to Gemini as part of a multi-turn conversation so the model can refine it directly. When no image exists (e.g. a prior failed attempt), the original description and all amendments are concatenated into a single prompt instead.

`amend` requires a prior `describe` for the same card.

### `status`

Shows the state of all generation tasks recorded in the session state file.

```bash
npm run generate-images -- status
```

Example output:

```
barbarian              [████████████████████] DONE     (15/4/2026, 14:23:01)
warrior                [░░░░░░░░░░░░░░░░░░░░] FAILED   No image returned from Gemini API.
SoHH-sc1-battleground  [░░░░░░░░░░░░░░░░░░░░] PENDING

1 done · 0 running · 1 pending · 1 failed
```

## Configuration

Edit `packages/web/scripts/generate-images.config.ts` to change generation parameters:

| Field          | Default                    | Description                                  |
| -------------- | -------------------------- | -------------------------------------------- |
| `apiKey`       | `$GEMINI_API_KEY`          | Gemini API key (read from environment)       |
| `model`        | `gemini-2.0-flash-exp`     | Gemini model used for image generation       |
| `width`        | `512`                      | Output image width in pixels                 |
| `height`       | `768`                      | Output image height in pixels                |
| `systemPrompt` | _(dark fantasy art style)_ | Style instructions prepended to every prompt |

## State file

Generation history is persisted in `packages/web/scripts/.image-gen-state.json` (gitignored). It records each card's description, amendments, status, and any error message. This file is safe to delete to start fresh.
