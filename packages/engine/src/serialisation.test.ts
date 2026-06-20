/* eslint-disable @typescript-eslint/no-explicit-any */
import { Counter } from '@songsofdoom/common';
import * as Game from '@songsofdoom/game';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	BooleanField,
	CapabilityField,
	EntitiesField,
	EntityField,
	FocusesField,
	PaymentField,
	ResultField
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
		const entry = makeEntry();
		const json = serialiseJournalEntry(entry, context);
		const restored = deserialiseJournalEntry(json, context);

		expect(restored.procedureId).toBe(entry.procedureId);
		expect(restored.state.step).toBe(entry.state.step);
	});

	it('round-trips an entry with parentIndex', () => {
		const entry = makeEntry({ parentIndex: 3 });
		const json = serialiseJournalEntry(entry, context);
		const restored = deserialiseJournalEntry(json, context);

		expect(restored.parentIndex).toBe(3);
	});

	it('round-trips an entry with loop internals', () => {
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
		const entry = makeEntry({
			state: { step: 'done', status: 'complete', game: testGame() }
		});
		const json = serialiseJournalEntry(entry, context);
		const restored = deserialiseJournalEntry(json, context);

		expect(restored.state.status).toBe('complete');
	});

	it('round-trips a cancelled entry', () => {
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
		const context = createEngineSerialisationContext();
		const lightArmour = context.resolveTalent('light-armour');
		expect(lightArmour).toBeDefined();
		expect(lightArmour!.id).toBe('light-armour');
	});

	it('returns undefined for unknown talent ids', () => {
		const context = createEngineSerialisationContext();
		expect(context.resolveTalent('nonexistent')).toBeUndefined();
	});

	it('resolves known stats', () => {
		const context = createEngineSerialisationContext();
		const strength = context.resolveStat('strength');
		expect(strength).toBeDefined();
		expect(strength!.type).toBe('strength');
	});

	it('resolves known events without throwing', () => {
		const context = createEngineSerialisationContext();
		expect(() => context.resolveEvent('attacks')).not.toThrow();
	});

	it('resolves known slots without throwing', () => {
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

	it('brands FocusesField with @type', () => {
		const field = new FocusesField({ name: 'f', focuses: new Counter() });
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('FocusesField');
	});

	it('brands BooleanField with @type', () => {
		const field = new BooleanField({ name: 'confirm' });
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('BooleanField');
	});

	it('brands CapabilityField with @type', () => {
		const field = new CapabilityField({
			name: 'reaction',
			choices: new Set<CapabilityRef>()
		});
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('CapabilityField');
	});

	it('brands ResultField with @type', () => {
		const field = new ResultField({ name: 'result' });
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('ResultField');
	});

	it('brands PaymentField with @type', () => {
		const field = new PaymentField({
			name: 'cost',
			cost: new Game.ActualCapabilityCost({ health: 2 })
		});
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('PaymentField');
	});

	it('brands EntityField with @type', () => {
		const field = new EntityField({ name: 'target', entities: [] });
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('EntityField');
	});

	it('brands EntitiesField with @type', () => {
		const field = new EntitiesField({ name: 'targets', entities: [] });
		const json = serialiseToObject(field);
		expect(json['@type']).toBe('EntitiesField');
	});

	// -------------------------------------------------------------------
	// Round-trips
	// -------------------------------------------------------------------

	it('round-trips a BooleanField', () => {
		const field = new BooleanField({ name: 'confirm', required: false });
		const restored = roundTrip(field);
		expect(restored.name).toBe('confirm');
		expect(restored.required).toBe(false);
	});

	it('round-trips a ResultField', () => {
		const field = new ResultField({ name: 'outcome' });
		const restored = roundTrip(field);
		expect(restored.name).toBe('outcome');
		expect(restored.required).toBe(true);
	});

	it('round-trips a PaymentField with cost', () => {
		const field = new PaymentField({
			name: 'cost',
			cost: new Game.ActualCapabilityCost({ health: 3 })
		});
		const restored = roundTrip(field);
		expect(restored.name).toBe('cost');
		expect(restored.cost.health).toBe(3);
	});

	it('round-trips an EntityField with entity ids', () => {
		const field = new EntityField({ name: 'target', entities: ['plr1', 'plr2'] });
		const restored = roundTrip(field);
		expect(restored.name).toBe('target');
		expect(restored.entities).toEqual(['plr1', 'plr2']);
	});

	it('round-trips an EntitiesField with entity ids, min and max', () => {
		const field = new EntitiesField({
			name: 'targets',
			entities: ['plr1', 'plr2'],
			min: 2,
			max: 4
		});
		const restored = roundTrip(field);
		expect(restored.name).toBe('targets');
		expect(restored.entities).toEqual(['plr1', 'plr2']);
		expect(restored.min).toBe(2);
		expect(restored.max).toBe(4);
	});

	it('round-trips a CapabilityField with Set of choices', () => {
		const ref: CapabilityRef = { cardId: 'trt1', capabilityId: 'foo' };
		const field = new CapabilityField({
			name: 'reaction',
			choices: new Set([ref])
		});
		const restored = roundTrip(field);
		expect(restored.name).toBe('reaction');
		expect(restored.choices).toEqual(field.choices);
	});
});
