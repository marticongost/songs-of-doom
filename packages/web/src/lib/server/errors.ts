/**
 * Server-side error classes for game operations.
 *
 * These allow API route handlers to discriminate errors with `instanceof`
 * instead of fragile string matching on `err.message`.
 */

/** An entity (game, campaign, character, etc.) was not found. → HTTP 404 */
export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NotFoundError';
	}
}

/**
 * The operation cannot be completed due to a conflict with the current state
 * (e.g. wrong game status, duplicate participation, missing prerequisites). → HTTP 409
 */
export class ConflictError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ConflictError';
	}
}
