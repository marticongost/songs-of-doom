import { browser } from '$app/environment';
import { page } from '$app/state';
import {
	createEngineSerialisationContext,
	engineSerialisation,
	type EngineSerialisationContext,
	type Field,
	type JournalEntry
} from '@songsofdoom/engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GameStatus = 'idle' | 'connecting' | 'lobby' | 'awaiting_input' | 'complete' | 'error';

interface GameMeta {
	status: string;
	campaignId: string | null;
	ownerId: string | null;
	participants: Array<{ userId: string; characterId: number; characterName: string }>;
}

interface StateEventPayload {
	newEntries: JournalEntry[];
}

interface InputRequiredPayload {
	awaitingPlayerId: string;
	fields: Field<unknown>[];
}

/** Union of all possible SSE payloads. */
type SSEPayload = StateEventPayload | InputRequiredPayload;

// ---------------------------------------------------------------------------
// GameStore
// ---------------------------------------------------------------------------

/**
 * Client-side reactive game state manager.
 *
 * Holds the journal array (derived from SSE events), current game metadata,
 * input field state, and connection status.  All mutations are server-driven —
 * the client only supplies input via {@link supplyInput}.
 *
 * Intended to be instantiated once per game route and shared via Svelte
 * context ({@link GAME_STORE_KEY}).  Do not instantiate directly in
 * components — use {@link getContext} instead.
 *
 * @module — Svelte 5 runes module.
 */
export class GameStore {
	// --- Reactive state ---

	gameId = $state<string | null>(null);
	journal = $state<JournalEntry[]>([]);
	status = $state<GameStatus>('idle');
	inputFields = $state<Field<unknown>[]>([]);
	awaitingPlayerId = $state<string | null>(null);
	error = $state<string | null>(null);
	gameMeta = $state<GameMeta | null>(null);

	// --- Derived ---

	get currentEntry(): JournalEntry | undefined {
		return this.journal.at(-1);
	}

	get gameState() {
		return this.currentEntry?.state.game;
	}

	get journalLength(): number {
		return this.journal.length;
	}

	// --- Private ---

	/** Abort controller for the active SSE fetch, if any. */
	private _abortController: AbortController | null = null;

	/** Serialisation context matching the server's, used to decode SSE payloads. */
	private _context: EngineSerialisationContext | null = null;

	// -------------------------------------------------------------------
	// Public API
	// -------------------------------------------------------------------

	/**
	 * Connect to a game.
	 *
	 * 1. Fetches `GET /api/game/{gameId}` for the current state snapshot
	 *    and metadata (status, participants).
	 * 2. Opens an SSE stream (`GET /api/game/{gameId}/events?since=-1`) for
	 *    live journal updates.  The `since=-1` parameter triggers the server
	 *    to flush **all** journal entries before streaming live events.
	 *
	 * The journal array is populated from the SSE catch-up.  Components derive
	 * the board from {@link gameState} and the log from {@link journal}.
	 *
	 * Call `GET /api/game/{gameId}/log` separately (via {@link fetchJournal})
	 * when the user opens the game log / history panel.
	 */
	async connect(gameId: string): Promise<void> {
		if (!browser) return;

		this._abort();

		this.gameId = gameId;
		this.status = 'connecting';
		this.error = null;
		this.journal = [];

		// Lazy-initialise the serialisation context (needs catalog data
		// which is only available after the game package modules load).
		if (!this._context) {
			this._context = createEngineSerialisationContext();
		}

		const locale = this._locale;

		try {
			// Step 1 — fetch current state + metadata
			const stateUrl = `/${locale}/api/game/${gameId}`;
			const stateRes = await fetch(stateUrl, {
				headers: { 'Game-Client-Version': GAME_VERSION }
			});

			if (!stateRes.ok) {
				if (stateRes.status === 409) {
					const body = await stateRes.json();
					this._handleVersionMismatch(body.requiredVersion);
					return;
				}
				this.status = 'error';
				this.error = `Failed to fetch game state: ${stateRes.status}`;
				return;
			}

			const meta = (await stateRes.json()) as {
				id: GameStatus;
				status: string;
				campaignId: string | null;
				ownerId: string | null;
				participants: GameMeta['participants'];
				state: unknown;
			};
			this.gameMeta = {
				status: meta.status,
				campaignId: meta.campaignId,
				ownerId: meta.ownerId,
				participants: meta.participants
			};

			// Transition immediately for PREPARATION games — no engine / state
			// events will arrive until the game is started.
			if (meta.status === 'PREPARATION') {
				this.status = 'lobby';
			}

			// Step 2 — open SSE stream (catch-up via ?since=-1)
			this._subscribeSSE(gameId, -1);
		} catch (err) {
			if (this.status !== 'error') {
				this.status = 'error';
				this.error = err instanceof Error ? err.message : 'Connection failed';
			}
		}
	}

	/**
	 * Supply player input.
	 *
	 * Sends a `POST /api/game/{gameId}/input` with field values keyed by name.
	 * The server runs the engine until the next `InputStep` (or completion)
	 * and broadcasts state updates via SSE — the client does **not** process
	 * the response body for state changes.
	 */
	async supplyInput(input: Record<string, unknown>): Promise<void> {
		if (!browser || !this.gameId) return;

		const locale = this._locale;

		try {
			const res = await fetch(`/${locale}/api/game/${this.gameId}/input`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Game-Client-Version': GAME_VERSION
				},
				body: JSON.stringify(input)
			});

			if (!res.ok) {
				if (res.status === 409) {
					const body = await res.json();
					this._handleVersionMismatch(body.requiredVersion);
					return;
				}
				this.error = `Input failed: ${res.status}`;
			}
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Input request failed';
		}
	}

	/**
	 * Start the game (owner only).
	 *
	 * Sends `POST /{locale}/api/game/{gameId}/start`. The server broadcasts
	 * a `meta` event and initial journal entries via SSE.
	 */
	async startGame(): Promise<void> {
		if (!browser || !this.gameId) return;

		const locale = this._locale;

		try {
			const res = await fetch(`/${locale}/api/game/${this.gameId}/start`, {
				method: 'POST',
				headers: { 'Game-Client-Version': GAME_VERSION }
			});

			if (!res.ok) {
				if (res.status === 409) {
					const body = await res.json();
					this._handleVersionMismatch(body.requiredVersion);
					return;
				}
				this.error = `Start failed: ${res.status}`;
			}
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Start request failed';
		}
	}

	/**
	 * Join the game with the given character.
	 *
	 * Sends `POST /{locale}/api/game/{gameId}/join`. The server broadcasts
	 * a `meta` event with updated participants via SSE.
	 */
	async joinGame(characterId: number): Promise<void> {
		if (!browser || !this.gameId) return;

		const locale = this._locale;

		try {
			const res = await fetch(`/${locale}/api/game/${this.gameId}/join`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Game-Client-Version': GAME_VERSION
				},
				body: JSON.stringify({ characterId })
			});

			if (!res.ok) {
				if (res.status === 409) {
					const body = await res.json();
					this._handleVersionMismatch(body.requiredVersion);
					return;
				}
				this.error = `Join failed: ${res.status}`;
			}
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Join request failed';
		}
	}

	/**
	 * Leave the game.
	 *
	 * Sends `POST /{locale}/api/game/{gameId}/leave`. The server broadcasts
	 * a `meta` event with updated participants via SSE.
	 */
	async leaveGame(): Promise<void> {
		if (!browser || !this.gameId) return;

		const locale = this._locale;

		try {
			const res = await fetch(`/${locale}/api/game/${this.gameId}/leave`, {
				method: 'POST',
				headers: { 'Game-Client-Version': GAME_VERSION }
			});

			if (!res.ok) {
				this.error = `Leave failed: ${res.status}`;
			}
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Leave request failed';
		}
	}

	/**
	 * Fetch journal log entries (without game state) for the game log panel.
	 *
	 * Called on-demand when the user opens the history panel.  Returns
	 * lightweight {@link LogEntry} objects that omit the `game` snapshot.
	 *
	 * @param since - Optional. When provided, only entries with index > since
	 *   are returned (incremental fetch).
	 * @returns The parsed response body, or `undefined` on failure.
	 */
	async fetchJournal(since?: number): Promise<unknown> {
		if (!browser || !this.gameId) return;

		const locale = this._locale;
		const params = since !== undefined ? `?since=${since}` : '';

		try {
			const res = await fetch(`/${locale}/api/game/${this.gameId}/log${params}`, {
				headers: { 'Game-Client-Version': GAME_VERSION }
			});

			if (!res.ok) {
				if (res.status === 409) {
					const body = await res.json();
					this._handleVersionMismatch(body.requiredVersion);
					return;
				}
				this.error = `Failed to fetch journal: ${res.status}`;
				return;
			}

			return res.json();
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Journal fetch failed';
		}
	}

	// -------------------------------------------------------------------
	// Private helpers
	// -------------------------------------------------------------------

	/**
	 * Open an SSE stream using `fetch` + `ReadableStream`.
	 *
	 * We use `fetch` instead of `EventSource` because {@link EventSource} does
	 * not support custom headers — and the server requires `Game-Client-Version`
	 * on every request for version negotiation.
	 */
	private _subscribeSSE(gameId: string, since: number): void {
		const locale = this._locale;
		const url = `/${locale}/api/game/${gameId}/events?since=${since}`;

		this._abortController = new AbortController();

		fetch(url, {
			headers: { 'Game-Client-Version': GAME_VERSION },
			signal: this._abortController.signal
		})
			.then(async (res) => {
				if (res.status === 409) {
					const body = await res.json();
					this._handleVersionMismatch(body.requiredVersion);
					return;
				}

				if (!res.ok || !res.body) {
					this.status = 'error';
					this.error = `SSE stream failed: ${res.status}`;
					return;
				}

				const reader = res.body.getReader();
				const decoder = new TextDecoder();
				let buffer = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });

					// SSE events are separated by double newlines
					const events = buffer.split('\n\n');
					buffer = events.pop() ?? ''; // keep incomplete last chunk

					for (const raw of events) {
						if (!raw.trim()) continue;
						this._processSSEEvent(raw);
					}
				}
			})
			.catch((err: unknown) => {
				if (err instanceof DOMException && err.name === 'AbortError') return;
				this.status = 'error';
				this.error = err instanceof Error ? err.message : 'SSE stream failed';
			});
	}

	/**
	 * Parse and handle a single SSE event.
	 *
	 * SSE event format:
	 * ```
	 * event: state
	 * data: <serialised-json>
	 * ```
	 */
	private _processSSEEvent(raw: string): void {
		let eventType = '';
		let data = '';

		for (const line of raw.split('\n')) {
			if (line.startsWith('event: ')) {
				eventType = line.slice(7);
			} else if (line.startsWith('data: ')) {
				data = line.slice(6);
			}
		}

		if (!data || !this._context) return;

		try {
			const payload = engineSerialisation.deserialise<SSEPayload>(data, this._context);

			switch (eventType) {
				case 'state': {
					const statePayload = payload as StateEventPayload;
					if (statePayload.newEntries?.length) {
						this.journal = [...this.journal, ...statePayload.newEntries];
						// Transition from 'connecting' to whatever the engine says
						if (this.status === 'connecting') {
							this.status = this.inputFields.length > 0 ? 'awaiting_input' : 'complete';
						}
					}
					break;
				}

				case 'input-required': {
					const inputPayload = payload as InputRequiredPayload;
					this.awaitingPlayerId = inputPayload.awaitingPlayerId ?? null;
					this.inputFields = inputPayload.fields ?? [];
					this.status = 'awaiting_input';
					break;
				}

				case 'meta': {
					const metaPayload = payload as unknown as GameMeta;
					this.gameMeta = metaPayload;
					// Transition out of connecting or lobby when game starts.
					if (this.status === 'connecting' || this.status === 'lobby') {
						this.status = metaPayload.status === 'PREPARATION' ? 'lobby' : 'complete';
					}
					break;
				}
			}
		} catch (err) {
			console.error('Failed to deserialise SSE event:', err);
		}
	}

	/**
	 * Handle a version mismatch by reloading the page after a short delay
	 * so the user can see the reload banner / error message.
	 */
	private _handleVersionMismatch(_requiredVersion: string): void {
		this.status = 'error';
		this.error = 'New version available. Reloading…';
		setTimeout(() => window.location.reload(), 500);
	}

	/** Abort the active SSE connection and clean up. */
	private _abort(): void {
		if (this._abortController) {
			this._abortController.abort();
			this._abortController = null;
		}
	}

	/**
	 * Disconnect from the game — abort SSE, reset state.
	 *
	 * Call this when the component tree that owns the store is torn down
	 * (e.g. navigating away from the game route).
	 */
	disconnect(): void {
		this._abort();
		this.gameId = null;
		this.journal = [];
		this.status = 'idle';
		this.inputFields = [];
		this.awaitingPlayerId = null;
		this.error = null;
		this.gameMeta = null;
	}

	/** Current locale from the SvelteKit page store. */
	private get _locale(): string {
		return (page.data?.locale as string) ?? 'ca';
	}
}
