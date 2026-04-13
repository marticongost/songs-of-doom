import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import { Target } from '../..';
import type { MutableCardState } from '../game/cardstate';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { AttachEffect, attach } from './attach';

// ─── AttachEffect construction ────────────────────────────────────────────────

describe('AttachEffect construction', () => {
	it('attach() creates an AttachEffect with no target and stacking=false', () => {
		const effect = attach();
		expect(effect).toBeInstanceOf(AttachEffect);
		expect(effect.target).toBeUndefined();
		expect(effect.stacking).toBe(false);
	});

	it('attach({ stacking: true }) sets stacking to true', () => {
		const effect = attach({ stacking: true });
		expect(effect.stacking).toBe(true);
	});

	it('attach({}) defaults stacking to false', () => {
		const effect = attach({});
		expect(effect.stacking).toBe(false);
	});
});

// ─── AttachEffect.trigger ─────────────────────────────────────────────────────

describe('AttachEffect.trigger', () => {
	it('attaches the card to the given target, defaulting to the active card', async () => {
		const target = new Target({});
		const mutableState = mock<MutableGameState>();
		const targetCard = mock<MutableCardState>();
		const attachmentCard = mock<MutableCardState>();
		mutableState.requireCard.calledWith('c2').mockReturnValue(targetCard);
		mutableState.requireActiveCard.mockReturnValue(attachmentCard);
		const graph = mock<GameGraph>();
		graph.requestSingleTarget
			.calledWith(target, expect.objectContaining({ default: expect.any(Function) }))
			.mockResolvedValue('c2');
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await attach({ target }).trigger(graph);

		expect(targetCard.addAttachment).toHaveBeenCalledWith(mutableState, attachmentCard);
	});
});
