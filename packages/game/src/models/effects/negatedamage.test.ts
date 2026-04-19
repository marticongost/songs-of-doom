import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import { MutableAttackResolution } from '../game/attackresolution';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { MutableWoundResolution } from '../game/woundresolution';
import { NegateDamageEffect, negateDamage } from './negatedamage';

// ─── negateDamage factory ─────────────────────────────────────────────────────

describe('negateDamage factory', () => {
	it('negateDamage() creates a NegateDamageEffect', () => {
		expect(negateDamage()).toBeInstanceOf(NegateDamageEffect);
	});
});

// ─── NegateDamageEffect.apply — wound resolution active ──────────────────────

describe('NegateDamageEffect.apply — wound resolution active', () => {
	it('sets negated to true on the active wound resolution', async () => {
		const woundRes = new MutableWoundResolution({ targetId: 'trt1', damageDealt: 4 });
		const mutableState = mock<MutableGameState>({
			getActiveWoundResolution: () => woundRes
		});
		const graph = mock<GameGraph>();
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await negateDamage().apply(graph);

		expect(woundRes.negated).toBe(true);
	});

	it('does not touch the attack resolution when wound resolution is active', async () => {
		const woundRes = new MutableWoundResolution({ targetId: 'trt1', damageDealt: 4 });
		const attackRes = new MutableAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1'
		});
		const mutableState = mock<MutableGameState>({
			getActiveWoundResolution: () => woundRes,
			getActiveTestResolution: () => attackRes
		});
		const graph = mock<GameGraph>();
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await negateDamage().apply(graph);

		expect(attackRes.negated).toBe(false);
	});
});

// ─── NegateDamageEffect.apply — attack resolution active ─────────────────────

describe('NegateDamageEffect.apply — attack resolution active', () => {
	it('sets negated to true on the active attack resolution', async () => {
		const attackRes = new MutableAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1'
		});
		const mutableState = mock<MutableGameState>({
			getActiveWoundResolution: () => undefined,
			getActiveTestResolution: () => attackRes
		});
		const graph = mock<GameGraph>();
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await negateDamage().apply(graph);

		expect(attackRes.negated).toBe(true);
	});
});

// ─── NegateDamageEffect.apply — nothing active ───────────────────────────────

describe('NegateDamageEffect.apply — nothing active', () => {
	it('is a no-op when neither wound nor attack resolution is active', async () => {
		const mutableState = mock<MutableGameState>({
			getActiveWoundResolution: () => undefined,
			getActiveTestResolution: () => undefined
		});
		const graph = mock<GameGraph>();
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await expect(negateDamage().apply(graph)).resolves.toBeUndefined();
	});
});
