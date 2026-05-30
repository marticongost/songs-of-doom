/**
 * Cancels and rolls back the entire currently-executing effect group, rewinding the
 * game graph to the node before the effect started. Use this when an effect determines
 * it should not apply at all (e.g. exhausting a card that is already exhausted).
 */
export const rollbackEffect = (): never => {
	throw new EffectRolledBack();
};

/**
 * Error thrown by {@link rollbackEffect} to cancel and roll back the current
 * effect group.
 */
export class EffectRolledBack extends Error {}
