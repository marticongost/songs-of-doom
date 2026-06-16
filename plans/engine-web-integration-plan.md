# Engine ↔ Web Integration Plan

## 1. Architecture Decisions

### 1.1 Communication Model: REST + SSE

| Direction                  | Mechanism   | Purpose                                                               |
| -------------------------- | ----------- | --------------------------------------------------------------------- |
| Client → Server (commands) | REST `POST` | Supply player input (`/input`); engine runs automatically after input |
| Server → Client (events)   | SSE `GET`   | Broadcast live journal updates, input-required notifications, errors  |
| Client → Server (queries)  | REST `GET`  | Fetch full journal for game log (`/journal`), current state snapshot  |

Rationale:

- The engine is a **synchronous state machine**: `run()` processes steps until it hits an `InputStep`, then returns `false`. The client's only write operation is supplying input — the server calls `engine.supplyInput()` then `engine.run()` in response.
- There is no standalone "advance" operation — the engine always runs to the next `InputStep` (or completion) automatically. Game creation and server restart also trigger `engine.run()` server-side.
- All state broadcasts are server→client. SSE is simpler than WebSocket — plain HTTP, auto-reconnect via `EventSource`, trivial SvelteKit integration via `ReadableStream`.
- Writes go through REST for idempotency and serialisation at a single point.

### 1.2 Serialisation: Direct Domain Types (No DTOs)

The `Serialisation` class from `@songsofdoom/common` serialises domain types directly to JSON. No intermediate DTO layer.

Rationale:

- Monorepo, single deploy unit — server and client share the same type definitions from `@songsofdoom/game` and `@songsofdoom/engine`.
- The domain types ARE the presentation — cards render capabilities, effects, expressions directly.
- `Serialisation` already handles: type branding, object identity pools (dedup), circular references, Map with complex keys, custom `decompose`/`recompose` via `ObjectMapper`.
- Zero duplication: add a field once, it serialises automatically.

Trade-off: The wire format IS the API contract. Breaking changes force a client reload. Accepted because game sessions are short-lived (hours) and there are no third-party API consumers.

### 1.3 Breaking Changes: Code-First, Migration-Later

Deploy updated code with **backward-compatible `recompose`** first. Migration (re-serialising old journal entries) runs separately afterward.

Sequence:

1. Deploy code that reads old+new formats, writes new format only.
2. Clients reload (409 Conflict on version mismatch).
3. Migration script deserialises → serialises all journal entries (idempotent).
4. Later deploy: remove old-format recompose branches.

Rationale: Eliminates the downtime window. The server bridges formats in memory; the client never sees old-format data because API responses are always serialised with the current `decompose`.

### 1.4 Version Negotiation

- Server embeds git SHA at build time.
- Client sends `Game-Client-Version` header on every REST request and SSE connection.
- On mismatch: server returns `409 Conflict` with `{ requiredVersion }`. Client reloads.
- On SSE: server closes the stream with a `version-mismatch` event, client reloads.

### 1.5 State Management: Journal-Derived Views

The client does **not** maintain a separate mutable game state. Components derive their view from journal entries:

- `GameStore.svelte.ts` (Svelte 5 runes module) holds the journal array, current status, and input fields.
- Components use `$derived` to extract what they need from `currentEntry.state.game`.
- No client-side mutations — all write operations go through REST → server → SSE broadcast back.

### 1.6 Horizontal Scaling: Sticky Sessions via Pub/Sub _(future-proofing — not part of initial prototype)_

> **Note:** The initial prototype runs on a single server instance. This section describes the scaling strategy for when multiplayer traffic outgrows a single process — it is not implemented in the first slice.

In a multi-instance deployment, players of the same game may connect to different server instances. Each instance runs its own `GameManager` with in-memory `Engine` objects and SSE subscriber sets. To keep them in sync:

- **One instance owns the engine** for a given game. On game creation, the instance that handled the request becomes the owner. Ownership is recorded in the `Game` DB row.
- **Input requests are forwarded** to the owning instance (or the load balancer uses sticky sessions keyed on `gameId`).
- **SSE broadcasts go through PostgreSQL `LISTEN`/`NOTIFY`**. After appending a journal entry and persisting it, the owning instance emits a `NOTIFY game:{gameId}`. All instances subscribe to game channels and forward the event to their locally connected SSE clients.

```
Player A ──► Instance 1 (owns game X) ──► DB (persist journal)
                │                              │
                │ NOTIFY game:X                 │
                ▼                              ▼
           PostgreSQL ◄────────────────────────┘
                │
                │ LISTEN game:X
                ▼
Player B ──► Instance 2 ──► SSE forward to Player B
```

This keeps the architecture simple: the engine lives in one place (no distributed state machine), and SSE fan-out uses infrastructure already present (PostgreSQL). Redis Pub/Sub is an alternative if NOTIFY throughput becomes a bottleneck.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────┐
│                  SvelteKit Server                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  API Routes (+server.ts)                      │   │
│  │  POST /api/game/{id}/input                    │   │
│  │  GET  /api/game/{id}/events  (SSE)            │   │
│  │  GET  /api/game/{id}/journal (full journal)   │   │
│  │  GET  /api/game/{id}        (state snapshot)  │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                     │
│  ┌──────────────▼───────────────────────────────┐   │
│  │  GameManager                                   │   │
│  │  - engines: Map<gameId, Engine>                │   │
│  │  - subscribers: Map<gameId, Set<SSEController>>│   │
│  │  - supplyInput(gameId, input): void           │   │
│  │  - persistJournal(gameId): void               │   │
│  │  - broadcast(gameId, event): void             │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                     │
│  ┌──────────────▼───────────────────────────────┐   │
│  │  PostgreSQL                                    │   │
│  │  - JournalEntry table (gameId, data JSONB)     │   │
│  │  - Game table (id, status, version)            │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  engineSerialisation (Serialisation instance)  │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
         │                          │
    REST │                    SSE   │
         ▼                          ▼
   ┌──────────┐            ┌──────────┐
   │ Client A │            │ Client B │
   │ GameStore│            │ GameStore│
   │ journal[]│            │ journal[]│
   └──────────┘            └──────────┘
```

---

## 3. Engine Serialisation

### 3.1 Serialisation Instance

Located at `packages/engine/src/serialisation.ts`:

```typescript
import { Serialisation } from '@songsofdoom/common';
// ... all domain type imports

export const engineSerialisation = new Serialisation({
	types: [
		// All types that can appear in a JournalEntry
		MutableGameState,
		MutablePlayerState,
		MutableCardState,
		MutableLocationState,
		MutableCapabilityResolution,
		MutableAttackResolution,
		MutableWoundResolution,
		MutableTestResolution,
		// Effect types
		GatherCluesEffect,
		EngageEffect,
		DiscardEffect
		// ... all others
	],
	typeBranding: (type) => type.name,
	mappers: new Map([
		// Custom mappers for types with backward-compat or special needs
		// Initially empty — added as needed for breaking changes
	]),
	objectIdentity: new Map([
		[
			MutableCardState,
			{
				external: false,
				getObjectId: (card, _ctx) => card.id
			}
		],
		[
			MutablePlayerState,
			{
				external: false,
				getObjectId: (player, _ctx) => player.id
			}
		],
		[
			MutableLocationState,
			{
				external: false,
				getObjectId: (location, _ctx) => location.id
			}
		]
	])
});
```

### 3.2 Engine Integration

`Engine.toJSON()` and `Engine.fromJSON()` use `engineSerialisation`:

```typescript
// engine.ts
import { engineSerialisation } from '../serialisation';

toJSON(): string {
    return engineSerialisation.serialise(this._journal);
}

static fromJSON(json: string, procedureRegistry: ProcedureRegistry): Engine {
    const journal = engineSerialisation.deserialise<JournalEntry[]>(json);
    return new Engine(procedureRegistry, journal);
}
```

The `EngineSnapshot` interface is replaced by a plain `string` (the serialised JSON).

### 3.3 JournalEntry Serialisation Notes

- `JournalEntry.state.game` is a `ReadonlyGameState` — the serialisation maps it to `MutableGameState` for reconstruction (they share the same shape).
- `JournalEntry._loopQueue` is `unknown[]` — items are serialised via the default mapper (plain objects/arrays/primitives) or via registered object identity if the items are known types.
- `JournalEntry._loopParentStepId` and `parentIndex` are plain primitives, no special handling needed.
- The `@objects` pool deduplicates cards that appear in multiple places (hand, stage, attachments, decks).

---

## 4. API Design

### 4.1 REST Endpoints

All under `/[locale]/api/game/`.

#### `POST /[locale]/api/game`

Creates a new game in `PREPARATION` status with the chosen campaign. The creator is automatically added as the first participant.

**Body:**

```json
{
	"campaignId": "core-set",
	"characterId": 1
}
```

**Response 201:**

```json
{ "gameId": "abc123" }
```

#### `POST /[locale]/api/game/{gameId}/join`

Adds the authenticated user as a participant with a chosen character.

**Body:**

```json
{ "characterId": 2 }
```

**Response 200:** `{ "success": true }`
**Response 409:** Already joined, game not in PREPARATION, or game full.

#### `POST /[locale]/api/game/{gameId}/start`

Starts the game: creates the engine from the campaign, runs until the first `InputStep` or completion.

**Response 200:** `{ "success": true }`
**Response 409:** Game not in PREPARATION status.

#### `GET /[locale]/api/game/{gameId}`

Returns the current game state snapshot with metadata.

**Response 200:**

```json
{
	"id": "abc123",
	"status": "awaiting_input",
	"participants": [{ "userId": "user1", "characterId": 1 }],
	"state": {
		/* current game state, serialised */
	}
}
```

#### `GET /[locale]/api/game/{gameId}/state/{index}`

Returns the game state at a specific journal entry index. Supports negative indices (count from the back) for undo/redo.

**Response 200:**

```json
{
	"index": 5,
	"state": {
		/* game state at that journal entry, serialised */
	}
}
```

#### `GET /[locale]/api/game/{gameId}/log`

Returns the **full journal log** without game state snapshots (lightweight, for log rendering). Each entry includes `procedureId`, `step`, `status`, `parentIndex`, and other metadata but omits the `game` snapshot.

**Future:** `?since={index}` query param for incremental fetch.

**Response 200:**

```json
{
	"log": [
		/* LogEntry[] — JournalEntry without state.game */
	]
}
```

#### `POST /[locale]/api/game/{gameId}/input`

Supplies player input and runs the engine until the next `InputStep` (or completion). This is the **only client-initiated write operation**.

**Body:**

```json
{
	"destinationId": [0, 1],
	"confirm": true
}
```

**Response 200 (paused for input):**

```json
{
    "status": "awaiting_input",
    "awaitingPlayerId": "plr1",
    "fields": [
        { "@type": "TargetField", "name": "destinationId", "target": { ... } },
        { "@type": "BooleanField", "name": "confirm", "required": false }
    ],
    "newEntries": [ /* JournalEntry[] appended during this run */ ]
}
```

**Response 200 (complete — game or phase finished):**

```json
{
	"status": "complete",
	"newEntries": [
		/* ... */
	]
}
```

**Response 409:** Version mismatch — client must reload.

**Response 400:** Invalid input (wrong player, invalid field values, engine not awaiting input).

Note: the client also calls `POST /input` with an empty body `{}` when a field has `required: false` and the player chooses to "pass" — the engine handles `undefined`/`null` field values.

### 4.2 SSE Endpoint

#### `GET /[locale]/api/game/{gameId}/events`

Returns an SSE stream of **live** journal updates. Not intended for historical data — use `GET /log` for the full game log.

**Query params:** `?since={journalIndex}` — pre-flush entries after this index before streaming live (for reconnection catch-up). Must be provided on initial connection to avoid re-sending the entire journal.

**Headers:** `Game-Client-Version: {gitSha}`

**Events:**

```
event: state
data: {"newEntries": [{...}, {...}]}

event: input-required
data: {"awaitingPlayerId": "plr1", "fields": [{...}]}

event: version-mismatch
data: {"requiredVersion": "def456"}
```

The client opens this connection once per game session for live updates. `EventSource` handles reconnection automatically. On reconnect, the client sends `?since={lastKnownIndex}` to catch up on missed entries.

For the **game log** (full historical journal), the client calls `GET /[locale]/api/game/[gameId]/log` on initial page load and re-fetches incrementally if needed.

### 4.3 Version Check Middleware

A SvelteKit hook or shared helper that runs before every game API route:

```typescript
function checkVersion(request: Request): Response | null {
	const clientVersion = request.headers.get('Game-Client-Version');
	const gameVersion = GAME_VERSION; // from build-time env

	if (clientVersion && clientVersion !== gameVersion) {
		return Response.json({ requiredVersion: gameVersion }, { status: 409 });
	}
	return null; // proceed
}
```

---

## 5. Client-Side State Management

### 5.1 GameStore (`$lib/game/GameStore.svelte.ts`)

```typescript
// Svelte 5 runes module — imported as reactive state
class GameStore {
	gameId = $state<string | null>(null);
	journal = $state<JournalEntry[]>([]);
	status = $state<'idle' | 'awaiting_input' | 'complete' | 'error'>('idle');
	inputFields = $state<Field[]>([]);
	awaitingPlayerId = $state<string | null>(null);
	error = $state<string | null>(null);

	// Derived
	currentEntry = $derived(this.journal.at(-1));
	gameState = $derived(this.currentEntry?.state.game);
	journalLength = $derived(this.journal.length);

	// Methods
	async connect(gameId: string): Promise<void>;
	async supplyInput(input: Record<string, unknown>): Promise<void>;
	async fetchJournal(since?: number): Promise<void>; // for game log / initial load
	private subscribeSSE(): void;
	private handleVersionMismatch(requiredVersion: string): void;
}
```

Note: there is no `advance()` method. `supplyInput()` internally calls `POST /input`, which runs the engine until the next `InputStep`. The client never explicitly "advances" — it only supplies input in response to an `input-required` event.

### 5.2 Component Patterns

Components are **derived views** — they read from `GameStore` but never mutate directly:

```svelte
<!-- GameBoard.svelte -->
<script lang="ts">
	import { gameStore } from '$lib/game/GameStore.svelte';

	const playerHand = $derived(
		gameStore.gameState?.players.find((p) => p.id === myPlayerId)?.hand ?? []
	);
</script>

{#each playerHand as card}
	<CardDisplay {card} />
{/each}
```

### 5.3 Input Components

Input fields from the engine map to UI components:

| Field Type              | Component                                       |
| ----------------------- | ----------------------------------------------- |
| `TargetField`           | Target picker (clickable cards/locations)       |
| `CapabilityChoiceField` | Capability selector (list of actions/reactions) |
| `BooleanField`          | Checkbox or confirm/cancel buttons              |
| `EntityField`           | Entity picker (player/ally/creature selection)  |
| `FocusesField`          | Focus token allocation UI                       |
| `PaymentField`          | Cost payment UI (choose how to pay)             |
| `ResultField`           | Result picker (from a test roll)                |

A `FieldRenderer` component dispatches to the appropriate sub-component based on the field's `@type` brand.

---

## 6. Fault Tolerance

| Scenario                         | Handling                                                                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Server restart                   | Engine rebuilt from persisted journal in DB via `Engine.fromJSON()`.                                                                      |
| Client disconnect                | `EventSource` auto-reconnects; sends `?since={lastIndex}` to catch up on missed SSE events. Full journal always fetchable via `GET /log`. |
| Invalid input                    | Server rejects with `400`; client re-renders input form (no state corrupted)                                                              |
| Double-submit input              | Engine is no longer at InputStep → server rejects with `400` (idempotent)                                                                 |
| Stale client (missed SSE events) | On reconnect, `?since=` catches up missed entries. Full journal fetch as fallback.                                                        |
| Version mismatch                 | `409` → client reloads → re-fetches state (migration already upgraded DB)                                                                 |
| Corrupt journal entry            | `deserialise` throws during migration/recovery → entry flagged, manual fix                                                                |

---

## 7. Release Procedure for Breaking Changes

### 7.1 Routine (additive) Changes

_Adding fields, procedures, effects, enum values._

1. Make code change.
2. `npm run check && npm run test`.
3. Deploy. No migration, no version bump, no ObjectMapper changes.

### 7.2 Breaking Changes

_Renaming/removing fields, changing types, restructuring state shapes._

**Step A — Code:**

1. Update domain type(s).
2. Update affected `ObjectMapper.recompose` to handle **both** old and new formats.
3. Update `ObjectMapper.decompose` to write **only** new format.
4. Add test fixtures: old-format JSON → `deserialise` → assert correct object.
5. `npm run check && npm run test`.

**Step B — Deploy:**

1. Build and deploy new server + client code.
2. Old SSE clients receive `version-mismatch` → reload.
3. Server now reads old+new, writes new.
4. Game fully playable — no downtime.

**Step C — Migration:**

1. Run `npx tsx scripts/migrate-journals.ts` (idempotent, batch-processed).
2. All stored journal entries now in new format.

**Step D — Cleanup (next deploy):**

1. Remove old-format recompose branches from ObjectMappers.
2. Remove any temporary `_v` version markers.

### 7.3 Migration Script Template

```typescript
// packages/web/scripts/migrate-journals.ts
import { engineSerialisation } from '@songsofdoom/engine/serialisation';
import { prisma } from '$lib/server/db';

async function migrateJournals() {
	let cursor: string | undefined;
	let total = 0;

	while (true) {
		const batch = await prisma.journalEntry.findMany({
			take: 100,
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
			orderBy: { id: 'asc' }
		});

		if (batch.length === 0) break;

		await prisma.$transaction(
			batch.map((entry) => {
				const journal = engineSerialisation.deserialise(entry.data);
				return prisma.journalEntry.update({
					where: { id: entry.id },
					data: { data: engineSerialisation.serialise(journal) }
				});
			})
		);

		total += batch.length;
		cursor = batch[batch.length - 1].id;
		console.log(`Migrated ${total} entries...`);
	}

	console.log(`Done. ${total} entries migrated.`);
}

migrateJournals().catch(console.error);
```

---

## 8. Implementation Plan

### Phase 1: Foundation

- [x] **1.1** Create `packages/engine/src/serialisation.ts` — configure `Serialisation` instance with all domain types and identity rules for the entity catalog and other well known objects.
- [x] **1.2** Update `Engine.toJSON()` to use `engineSerialisation.serialise(this._journal)`.
- [x] **1.3** Update `Engine.fromJSON()` to use `engineSerialisation.deserialise(json)`.
- [x] **1.4** Export `engineSerialisation` from `packages/engine/src/index.ts`.

### Phase 2: Server Infrastructure

- [x] **2.0** Add `@songsofdoom/engine` to `packages/web/package.json` dependencies.
- [x] **2.1** Create `packages/web/src/lib/server/game-manager.ts` — manages `Map<gameId, Engine>`, persistence, and SSE subscribers.
- [x] **2.2** Create Prisma schema for `Game`, `GameParticipant` (user ↔ character pairing), and `JournalEntry` models.
- [x] **2.3** Implement `GameManager.createGame()`, `joinGame()`, `startGame()`, `getGameState()`, `getGameStateAtIndex()`, `getGameLog()`, and `persistJournal()`.
- [x] **2.4** Implement `GameManager.subscribe(gameId, controller)` / `unsubscribe()` for SSE broadcast.
- [ ] **2.5** _(Deferred — horizontal scaling)_ PostgreSQL `LISTEN`/`NOTIFY` relay for cross-instance SSE fan-out. See §1.6.
- [x] **2.6** Add `GAME_VERSION` build-time constant (git SHA via `vite.define`).
- [x] **2.7** Create version check middleware/helper in `$lib/server/version-check.ts`.

### Phase 3: REST API

- [x] **3.0a** Create `src/routes/[locale]/api/game/+server.ts` — `POST` to create a new game (PREPARATION status) with campaign + creator's character. Returns `{ gameId }`.
- [x] **3.0b** Create `src/routes/[locale]/api/game/[gameId]/join/+server.ts` — `POST` to add current user as a participant with a chosen character.
- [x] **3.0c** Create `src/routes/[locale]/api/game/[gameId]/start/+server.ts` — `POST` to start the game: creates engine from campaign, runs until first `InputStep` or completion.
- [x] **3.1** Create `src/routes/[locale]/api/game/[gameId]/+server.ts` — `GET` handler returning current game state snapshot + metadata (id, status, participants).
- [x] **3.1b** Create `src/routes/[locale]/api/game/[gameId]/state/[index]/+server.ts` — `GET` handler returning the game state at a specific journal entry index (supports negative indices for undo/redo).
- [x] **3.2** Create `src/routes/[locale]/api/game/[gameId]/log/+server.ts` — `GET` handler returning the full journal log without game state snapshots (lightweight, for log rendering).
- [x] **3.4** Add authentication checks — `POST` endpoints (create, join, start) verify `locals.user`; errors via `NotFoundError` / `ConflictError` from `$lib/server/errors.ts`.
- [x] **3.3** Create `src/routes/[locale]/api/game/[gameId]/input/+server.ts` — `POST` handler: `supplyInput()` then `engine.run()` until next `InputStep` or completion. The only client write endpoint during gameplay.
- [x] **3.5** Add input validation — verify the requesting player matches `awaitingPlayerId`, and that the engine is currently paused for input.
- [x] **3.6** Add version check (`Game-Client-Version` header) to all game API routes.
- [ ] **3.7** Add `?since=` query param to `GET /log` for incremental fetch (currently returns full log).
- [ ] **3.8** Add participation checks to `GET` endpoints (state, log, state/[index]) — verify the requesting user is a game participant.

### Phase 4: SSE

- [ ] **4.1** Create `src/routes/[locale]/api/game/[gameId]/events/+server.ts` — `GET` handler returning SSE stream.
- [ ] **4.2** Implement `?since=` catch-up: pre-flush entries after the given index before streaming live.
- [ ] **4.3** Implement `version-mismatch` event on version check failure.
- [ ] **4.4** Handle client disconnect: remove subscriber from GameManager.

### Phase 5: Client State Management

- [ ] **5.1** Create `packages/web/src/lib/game/GameStore.svelte.ts` — Svelte 5 runes module.
- [ ] **5.2** Implement `GameStore.connect(gameId)` — fetches full journal via `GET /log`, then opens SSE for live updates.
- [ ] **5.3** Implement `GameStore.supplyInput(input)` — `POST /input`, process response (updates journal, status, input fields). No separate `advance()` — the server runs the engine after supplying input.
- [ ] **5.4** Implement `GameStore.fetchJournal(since?)` — incremental or full journal fetch for game log rendering.
- [ ] **5.5** Implement `handleVersionMismatch()` — show reload banner on `409` or SSE `version-mismatch` event.
- [ ] **5.6** Embed `Game-Client-Version` in all fetch/EventSource requests.

### Phase 6: Input Components

- [ ] **6.1** Create `FieldRenderer.svelte` — dispatches to field-specific components based on `@type`.
- [ ] **6.2** Create `TargetFieldInput.svelte` — interactive card/location picker.
- [ ] **6.3** Create `CapabilityChoiceFieldInput.svelte` — list of actions/reactions.
- [ ] **6.4** Create `BooleanFieldInput.svelte` — confirm/cancel.
- [ ] **6.5** Create `EntityFieldInput.svelte` — player/ally/creature picker.
- [ ] **6.6** Create `FocusesFieldInput.svelte` — focus token allocation.
- [ ] **6.7** Create `PaymentFieldInput.svelte` — cost payment selection.
- [ ] **6.8** Create `ResultFieldInput.svelte` — test result picker.

### Phase 7: Game UI

- [ ] **7.1** Create game route: `src/routes/[locale]/game/[gameId]/`.
- [ ] **7.2** Create `GameBoard.svelte` — main game layout (player areas, encounter area).
- [ ] **7.3** Create `PlayerArea.svelte` — hand, stage, attachments, stats.
- [ ] **7.4** Create `CardDisplay.svelte` — card rendering from `CardState`.
- [ ] **7.5** Create `GameControls.svelte` — advance button, input panel.
- [ ] **7.6** Create `GameLog.svelte` — journal viewer (scrollable list of entries).
- [ ] **7.7** Create `ReactionPrompt.svelte` — reaction choice overlay/modal.

### Phase 8: Persistence & Recovery

- [ ] **8.1** Persist journal to DB after every `engine.run()` call in GameManager.
- [ ] **8.2** On server startup, rebuild engines for active games from persisted journals.
- [ ] **8.3** Implement game lifecycle: create, pause, resume, complete, abandon.
- [ ] **8.4** Create `scripts/migrate-journals.ts` — migration script template.

### Phase 9: Polish

- [ ] **9.1** Add loading states and error boundaries to all game components.
- [ ] **9.2** Add animation/transition for journal entry application (cards moving, stats changing).
- [ ] **9.3** Add spectator mode (read-only SSE, no input).
- [ ] **9.4** Add game creation flow (select scenario, invite players).
- [ ] **9.5** End-to-end test: create game → play through a full chapter → assert journal.

---

## 9. Key Files Reference

| File                                                                   | Purpose                                             |
| ---------------------------------------------------------------------- | --------------------------------------------------- |
| `packages/engine/src/serialisation.ts`                                 | Serialisation instance configuration                |
| `packages/engine/src/core/engine.ts`                                   | `toJSON()` / `fromJSON()` using serialisation       |
| `packages/web/src/lib/server/game-manager.ts`                          | Game lifecycle, persistence, SSE broadcast          |
| `packages/web/src/lib/server/errors.ts`                                | `NotFoundError` / `ConflictError` for API routes    |
| `packages/web/src/lib/game/GameStore.svelte.ts`                        | Client-side reactive game state                     |
| `packages/web/src/routes/[locale]/api/game/+server.ts`                 | `POST` create game                                  |
| `packages/web/src/routes/[locale]/api/game/[gameId]/+server.ts`        | `GET` game state snapshot + metadata                |
| `packages/web/src/routes/[locale]/api/game/[gameId]/join/+server.ts`   | `POST` join game                                    |
| `packages/web/src/routes/[locale]/api/game/[gameId]/start/+server.ts`  | `POST` start game (engine creation + initial run)   |
| `packages/web/src/routes/[locale]/api/game/[gameId]/log/+server.ts`    | `GET` journal log (lightweight, no game state)      |
| `packages/web/src/routes/[locale]/api/game/[gameId]/state/[index]/...` | `GET` game state at specific journal index          |
| `packages/web/src/routes/[locale]/api/game/[gameId]/input/+server.ts`  | `POST` player input + engine advance (not yet done) |
| `packages/web/src/routes/[locale]/api/game/[gameId]/events/+server.ts` | `GET` SSE stream (not yet done)                     |
| `packages/web/src/routes/[locale]/game/[gameId]/...`                   | Game UI pages                                       |
| `packages/web/src/lib/components/game/`                                | Game-specific Svelte components                     |
| `packages/web/scripts/migrate-journals.ts`                             | Journal format migration script                     |
| `packages/web/prisma/schema.prisma`                                    | `Game`, `GameParticipant`, `JournalEntry` models    |

---

## 10. Open Questions / Future Decisions

- **Q2:** How to handle the `_loopQueue: unknown[]` serialisation? Items like `FocusToken` enums and plain values work with the default mapper. Complex items need type registration or a custom mapper on `JournalEntry`.
- **Q5:** SSE event granularity — send the full `game` snapshot per journal entry, or metadata-only with a separate fetch? The simpler approach (full entry) is fine initially; optimise later if bandwidth becomes an issue.
- **Q6:** Sticky sessions vs input forwarding for multi-instance? Sticky sessions by `gameId` are simpler (load balancer config). Input forwarding (non-owning instance proxies to owner) avoids load balancer coupling but adds latency. Start with sticky sessions.
- **Q7:** What happens when the owning instance crashes? On restart, the instance reloads the engine from the journal. During the gap, input requests to that game fail — clients retry. A future improvement: another instance detects the stale owner and takes over.

## 11. Resolved Decisions

- **Persistence:** Use Prisma for `Game` and `JournalEntry` models — already set up with auth.
- **ProcedureRegistry:** Not serialised. It's code, not data. The journal references `ProcedureId` (an enum string). The registry is rebuilt from `procedureDefinitions` on deserialisation — the engine constructor receives it as a parameter.
- **User ↔ Character pairing:** A separate `GameParticipant` model (Prisma table) links `User`, `Game`, and the in-game player/character ID. The `Game` model itself does not store participant mappings — it only holds game-level metadata (status, chapter, turn, version).
