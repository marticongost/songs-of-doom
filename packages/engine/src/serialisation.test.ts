/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it } from 'vitest';
import { ProcedureId } from './core/procedureid';
import {
	createEngineSerialisationContext,
	deserialiseJournalEntry,
	serialiseJournalEntry,
	type EngineSerialisationContext
} from './serialisation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface MinimalGameState {
	readonly players: ReadonlyArray<any>;
}

function testGame(): any {
	return { players: [] } as MinimalGameState;
}

function makeEntry(overrides: Record<string, unknown> = {}) {
	return {
		procedureId: ProcedureId.Unimplemented,
		state: {
			step: 'start',
			status: 'ongoing' as const,
			game: testGame()
		},
		...overrides
	};
}

// ---------------------------------------------------------------------------
// serialiseJournalEntry / deserialiseJournalEntry
// ---------------------------------------------------------------------------

describe('serialiseJournalEntry / deserialiseJournalEntry', () => {
	let context: EngineSerialisationContext;

	beforeEach(() => {
		context = createEngineSerialisationContext();
	});

	it('round-trips a basic journal entry', () => {
		expect.assertions(2);

		const entry = makeEntry();
		const json = serialiseJournalEntry(entry, context);
		const restored = deserialiseJournalEntry(json, context);

		expect(restored.procedureId).toBe(entry.procedureId);
		expect(restored.state.step).toBe(entry.state.step);
	});

	it('round-trips an entry with parentIndex', () => {
		expect.assertions(1);

		const entry = makeEntry({ parentIndex: 3 });
		const json = serialiseJournalEntry(entry, context);
		const restored = deserialiseJournalEntry(json, context);

		expect(restored.parentIndex).toBe(3);
	});

	it('round-trips an entry with loop internals', () => {
		expect.assertions(2);

		const entry = makeEntry({
			_loopParentStepId: 'foreach_1',
			_loopQueue: [10, 20, 30]
		});
		const json = serialiseJournalEntry(entry, context);
		const restored = deserialiseJournalEntry(json, context);

		expect(restored._loopParentStepId).toBe('foreach_1');
		expect(restored._loopQueue).toEqual([10, 20, 30]);
	});

	it('round-trips a completed entry', () => {
		expect.assertions(1);

		const entry = makeEntry({
			state: { step: 'done', status: 'complete', game: testGame() }
		});
		const json = serialiseJournalEntry(entry, context);
		const restored = deserialiseJournalEntry(json, context);

		expect(restored.state.status).toBe('complete');
	});

	it('round-trips a cancelled entry', () => {
		expect.assertions(1);

		const entry = makeEntry({
			state: { step: 'done', status: 'cancelled', game: testGame() }
		});
		const json = serialiseJournalEntry(entry, context);
		const restored = deserialiseJournalEntry(json, context);

		expect(restored.state.status).toBe('cancelled');
	});
});

// ---------------------------------------------------------------------------
// createEngineSerialisationContext
// ---------------------------------------------------------------------------

describe('createEngineSerialisationContext', () => {
	it('returns a context that resolves talents from talent data', () => {
		expect.assertions(2);
		const context = createEngineSerialisationContext();

		const lightArmour = context.resolveTalent('light-armour');
		expect(lightArmour).toBeDefined();
		expect(lightArmour!.id).toBe('light-armour');
	});

	it('returns undefined for unknown talent ids', () => {
		expect.assertions(1);

		const context = createEngineSerialisationContext();
		expect(context.resolveTalent('nonexistent')).toBeUndefined();
	});

	it('resolves known stats', () => {
		expect.assertions(2);

		const context = createEngineSerialisationContext();
		const strength = context.resolveStat('strength');
		expect(strength).toBeDefined();
		expect(strength!.type).toBe('strength');
	});

	it('resolves known events without throwing', () => {
		expect.assertions(1);

		const context = createEngineSerialisationContext();
		expect(() => context.resolveEvent('attacks')).not.toThrow();
	});

	it('resolves known slots without throwing', () => {
		expect.assertions(1);

		const context = createEngineSerialisationContext();
		expect(() => context.resolveSlot('hand')).not.toThrow();
	});
});
