import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { GameGraph, TestProps } from '../game/gamegraph';
import type { ReadonlyGameState } from '../game/gamestate';
import { attack } from './attack';
import { BeforeTest, Effect } from './effect';

class BeforeTestEffect extends Effect {
	override readonly testTiming = BeforeTest;

	async apply(): Promise<void> {}
}

describe('AttackEffect.apply', () => {
	it('registers test callbacks that emit attack events', async () => {
		const graph = mock<GameGraph>();
		const state = mock<ReadonlyGameState>();
		Object.defineProperty(graph, 'current', { get: () => ({ state }), configurable: true });
		state.requireSubject.mockReturnValue({ id: 'plr1' } as never);
		const events: string[] = [];
		let capturedTestProps: TestProps | undefined;

		graph.requestTargets.calledWith(undefined).mockResolvedValue(['plr2']);
		graph.triggerEvent.mockImplementation(async (eventType) => {
			events.push(eventType);
		});
		graph.test.mockImplementation(async (props) => {
			capturedTestProps = props;
			await props.beforeTest?.(graph);
			return 0;
		});

		await attack({ expression: 1, results: { '0+': 1 } }).apply(graph);

		expect(capturedTestProps).toMatchObject({
			subjectId: 'plr1',
			targetId: 'plr2',
			proficiency: 1
		});
		expect(capturedTestProps?.beforeTest).toBeTypeOf('function');
		expect(events).toEqual(['attack']);
	});

	it('keeps attack event callbacks ahead of other before-test effects', async () => {
		const graph = mock<GameGraph>();
		const state = mock<ReadonlyGameState>();
		Object.defineProperty(graph, 'current', { get: () => ({ state }), configurable: true });
		state.requireSubject.mockReturnValue({ id: 'plr1' } as never);
		const events: string[] = [];
		const beforeTestEffect = new BeforeTestEffect();

		graph.requestTargets.calledWith(undefined).mockResolvedValue(['plr2']);
		graph.triggerEvent.mockImplementation(async (eventType) => {
			events.push(eventType);
		});
		graph.test.mockImplementation(async (props) => {
			await props.beforeTest?.(graph);
			for (const effect of props.effects ?? []) {
				if (effect.testTiming === BeforeTest) {
					events.push('beforeTestEffect');
				}
			}
			return 0;
		});

		await attack({ expression: 1, results: { '0+': 1 } }).apply(graph, [beforeTestEffect]);

		expect(events).toEqual(['attack', 'beforeTestEffect']);
	});
});
