# Card Image Generation

The project provides two scripts for generating card artwork: one using the Gemini API and another using fal.ai. Both save images to the web package's image asset directory.

## Setup

Add your API key(s) to `.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
FAL_KEY=your_fal_api_key_here
```

All commands are run from `packages/web/`:

```bash
cd packages/web
npm run gen-image-gemini -- <command> [args]
npm run gen-image-fal -- <command> [args]
```

## Commands (both scripts)

### `missing`

Lists all cards that are expected to have an image but don't yet. Disciplines, modules, and campaign root nodes are excluded — only entity types that appear as physical cards are checked.

```bash
npm run gen-image-gemini -- missing
npm run gen-image-fal -- missing
```

### `describe <card-id> <description>`

Generates an image for a card. The description is sent to the API together with the configured system prompt to produce the illustration, which is saved as `src/lib/assets/img/cards/{card-id}.jpg`.

```bash
npm run gen-image-gemini -- describe warrior "A battle-hardened fighter in heavy plate armor, scarred face, holding a longsword"
```

If an image or a prior task already exists for the card, the command errors out. Pass `--redo` to overwrite:

```bash
npm run gen-image-gemini -- describe warrior "..." --redo
```

### `amend <card-id> <amendment>`

Refines a previously generated image. The amendment is appended to the task's history and the image is regenerated.

For Gemini, when an existing image is on disk, it is sent back as part of a multi-turn conversation so the model can refine it directly. For fal.ai, each generation is independent — amendments are concatenated to the original description.

```bash
npm run gen-image-gemini -- amend warrior "Make the armor darker and more worn, add a torn cape"
```

`amend` requires a prior `describe` for the same card.

### `status`

Shows the state of all generation tasks recorded in the session state file.

```bash
npm run gen-image-gemini -- status
```

Example output:

```
barbarian              [████████████████████] DONE     (15/4/2026, 14:23:01)
warrior                [░░░░░░░░░░░░░░░░░░░░] FAILED   No image returned from Gemini API.
SoHH-sc1-battleground  [░░░░░░░░░░░░░░░░░░░░] PENDING

1 done · 0 running · 1 pending · 1 failed
```

## Configuration

### Gemini (`packages/web/scripts/generate-images.config.ts`)

| Field          | Default                      | Description                                  |
| -------------- | ---------------------------- | -------------------------------------------- |
| `apiKey`       | `$GEMINI_API_KEY`            | Gemini API key (read from environment)       |
| `model`        | `gemini-3-pro-image-preview` | Gemini model used for image generation       |
| `aspectRatio`  | `16:9`                       | Output image aspect ratio                    |
| `imageSize`    | `1K`                         | Output image size                            |
| `systemPrompt` | _(dark fantasy art style)_   | Style instructions prepended to every prompt |

### fal.ai (`packages/web/scripts/gen-image-fal.config.ts`)

| Field          | Default                                        | Description                                  |
| -------------- | ---------------------------------------------- | -------------------------------------------- |
| `apiKey`       | `$FAL_KEY`                                     | fal.ai API key (read from environment)       |
| `model`        | `fal-ai/bytedance/seedream/v4.5/text-to-image` | fal.ai model used for image generation       |
| `imageSize`    | `landscape_16_9`                               | Output image aspect ratio                    |
| `systemPrompt` | _(dark fantasy art style)_                     | Style instructions prepended to every prompt |

## State files

- Gemini: `packages/web/scripts/.image-gen-state.json` (gitignored)
- fal.ai: `packages/web/scripts/.image-gen-fal-state.json` (gitignored)

Each records the card's description, amendments, status, and any error message. These files are safe to delete to start fresh.
