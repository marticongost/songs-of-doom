import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { GameGraph, TestProps } from '../game/gamegraph';
import { attack } from './attack';
import { BeforeTest, Effect } from './effect';

class BeforeTestEffect extends Effect {
	override readonly testTiming = BeforeTest;

	async trigger(): Promise<void> {}
}

describe('AttackEffect.trigger', () => {
	it('registers test callbacks that emit attack events', async () => {
		const graph = mock<GameGraph>();
		const events: string[] = [];
		let capturedTestProps: TestProps | undefined;

		graph.requireSubject.mockReturnValue({ id: 'p1' });
		graph.requestTargets
			.calledWith(undefined, expect.objectContaining({ default: expect.any(Function) }))
			.mockResolvedValue(['p2']);
		graph.eventTriggered.mockImplementation(async (eventType) => {
			events.push(eventType);
		});
		graph.test.mockImplementation(async (props) => {
			capturedTestProps = props;
			await props.beforeTest?.(graph);
			return 0;
		});

		await attack({ expression: 1, results: { '0+': 1 } }).trigger(graph);

		expect(capturedTestProps).toMatchObject({
			subjectId: 'p1',
			targetId: 'p2',
			proficiency: 1
		});
		expect(capturedTestProps?.beforeTest).toBeTypeOf('function');
		expect(events).toEqual(['attack']);
	});

	it('keeps attack event callbacks ahead of other before-test effects', async () => {
		const graph = mock<GameGraph>();
		const events: string[] = [];
		const beforeTestEffect = new BeforeTestEffect();

		graph.requireSubject.mockReturnValue({ id: 'p1' });
		graph.requestTargets
			.calledWith(undefined, expect.objectContaining({ default: expect.any(Function) }))
			.mockResolvedValue(['p2']);
		graph.eventTriggered.mockImplementation(async (eventType) => {
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

		await attack({ expression: 1, results: { '0+': 1 } }).trigger(graph, [beforeTestEffect]);

		expect(events).toEqual(['attack', 'beforeTestEffect']);
	});
});
