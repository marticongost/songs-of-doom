/* eslint-disable @typescript-eslint/no-explicit-any */
import { Counter } from '@songsofdoom/common';
import * as Game from '@songsofdoom/game';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	BooleanField,
	CapabilityChoiceField,
	EntityField,
	FocusesField,
	PaymentField,
	ResultField,
	TargetField
} from './core/input';
import { ProcedureId } from './core/procedureid';
import {
	createEngineSerialisationContext,
	deserialiseJournalEntry,
	engineSerialisation,
	serialiseJournalEntry,
	type EngineSerialisationContext
} from './serialisation';
import type { CapabilityRef } from './state/cardstate';

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

// ---------------------------------------------------------------------------
// Field serialisation (engineSerialisation)
// ---------------------------------------------------------------------------

describe('engineSerialisation — fields', () => {
	let context: EngineSerialisationContext;

	beforeEach(() => {
		context = createEngineSerialisationContext();
	});

	function roundTrip<T>(value: T): T {
		const json = engineSerialisation.serialise(value, context);
		return engineSerialisation.deserialise<T>(json, context);
	}

	function serialiseToObject(value: unknown): Record<string, unknown> {
		return JSON.parse(engineSerialisation.serialise(value, context));
	}

	// -------------------------------------------------------------------
	// @type branding
	// -------------------------------------------------------------------

	it('brands TargetField with @type', () => {
		expect.assertions(1);
		const field = new TargetField({ name: 'dest', target: new Game.Target('player') });
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('TargetField');
	});

	it('brands FocusesField with @type', () => {
		expect.assertions(1);
		const field = new FocusesField({ name: 'f', focuses: new Counter() });
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('FocusesField');
	});

	it('brands BooleanField with @type', () => {
		expect.assertions(1);
		const field = new BooleanField({ name: 'confirm' });
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('BooleanField');
	});

	it('brands CapabilityChoiceField with @type', () => {
		expect.assertions(1);
		const field = new CapabilityChoiceField({
			name: 'reaction',
			choices: new Set<CapabilityRef>()
		});
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('CapabilityChoiceField');
	});

	it('brands ResultField with @type', () => {
		expect.assertions(1);
		const field = new ResultField({ name: 'result' });
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('ResultField');
	});

	it('brands PaymentField with @type', () => {
		expect.assertions(1);
		const field = new PaymentField({
			name: 'cost',
			cost: new Game.ActualCapabilityCost({ health: 2 })
		});
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('PaymentField');
	});

	it('brands EntityField with @type', () => {
		expect.assertions(1);
		const field = new EntityField({ name: 'target', entities: [] });
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('EntityField');
	});

	// -------------------------------------------------------------------
	// Round-trips
	// -------------------------------------------------------------------

	it('round-trips a BooleanField', () => {
		expect.assertions(2);
		const field = new BooleanField({ name: 'confirm', required: false });
		const restored = roundTrip(field);
		expect(restored.name).toBe('confirm');
		expect(restored.required).toBe(false);
	});

	it('round-trips a ResultField', () => {
		expect.assertions(2);
		const field = new ResultField({ name: 'outcome' });
		const restored = roundTrip(field);
		expect(restored.name).toBe('outcome');
		expect(restored.required).toBe(true);
	});

	it('round-trips a TargetField with target properties', () => {
		expect.assertions(2);
		const field = new TargetField({ name: 'dest', target: new Game.Target('player') });
		const restored = roundTrip(field);
		expect(restored.name).toBe('dest');
		expect(restored.target.constructor.name).toBe('Target');
	});

	it('round-trips a PaymentField with cost', () => {
		expect.assertions(2);
		const field = new PaymentField({
			name: 'cost',
			cost: new Game.ActualCapabilityCost({ health: 3 })
		});
		const restored = roundTrip(field);
		expect(restored.name).toBe('cost');
		expect(restored.cost.health).toBe(3);
	});

	it('round-trips an EntityField with entity ids', () => {
		expect.assertions(2);
		const field = new EntityField({ name: 'target', entities: ['plr1', 'plr2'] });
		const restored = roundTrip(field);
		expect(restored.name).toBe('target');
		expect(restored.entities).toEqual(['plr1', 'plr2']);
	});

	it('round-trips a CapabilityChoiceField with Set of choices', () => {
		expect.assertions(2);
		const ref: CapabilityRef = { cardId: 'trt1', capability: {} as Game.Capability };
		const field = new CapabilityChoiceField({
			name: 'reaction',
			choices: new Set([ref])
		});
		const restored = roundTrip(field);
		expect(restored.name).toBe('reaction');
		expect(restored.choices).toBeInstanceOf(Set);
	});
});
