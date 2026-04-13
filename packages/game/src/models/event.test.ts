import type { LocalisedText } from '@songsofdoom/common/localisation';
import { describe, expect, it } from 'vitest';
import { AndExpression } from './expressions/boolean';
import { BooleanExpression } from './expressions/boolean/boolean-expression';
import type { GameState } from './game/gamestate';
import { Event } from './event';

class TestExpression extends BooleanExpression {
	constructor(private readonly text: string) {
		super();
	}

	override translate(): LocalisedText {
		return { en: this.text };
	}

	override evaluate(_state: GameState): boolean {
		return false;
	}
}

const name = { en: 'Default description' };
const shortDescription = { en: 'Short description' };

describe('Event.getTriggerDescription', () => {
	it('returns the event name when no condition is provided', () => {
		const event = new Event({ type: 'played', name });

		expect(event.getTriggerDescription()).toEqual({
			description: name,
			condition: undefined
		});
	});

	it('returns the matching short form and clears the condition for an exact match', () => {
		const matchingCondition = new TestExpression('matching');
		const event = new Event({
			type: 'played',
			name,
			shortForms: [
				{
					match: (expression) => expression === matchingCondition,
					description: shortDescription
				}
			]
		});

		expect(event.getTriggerDescription(matchingCondition)).toEqual({
			description: shortDescription,
			condition: undefined
		});
	});

	it('prioritizes the first matching short form when multiple rules match', () => {
		const matchingCondition = new TestExpression('matching');
		const firstDescription = { en: 'First description' };
		const secondDescription = { en: 'Second description' };
		const event = new Event({
			type: 'played',
			name,
			shortForms: [
				{
					match: (expression) => expression === matchingCondition,
					description: firstDescription
				},
				{
					match: (expression) => expression === matchingCondition,
					description: secondDescription
				}
			]
		});

		expect(event.getTriggerDescription(matchingCondition)).toEqual({
			description: firstDescription,
			condition: undefined
		});
	});

	it('returns the matching short form and preserves the remaining condition for a partial and-match', () => {
		const matchingCondition = new TestExpression('matching');
		const remainingCondition = new TestExpression('remaining');
		const event = new Event({
			type: 'played',
			name,
			shortForms: [
				{
					match: (expression) => expression === matchingCondition,
					description: shortDescription
				}
			]
		});

		expect(
			event.getTriggerDescription(new AndExpression(matchingCondition, remainingCondition))
		).toEqual({
			description: shortDescription,
			condition: remainingCondition
		});
	});

	it('returns the matching short form and preserves multiple remaining conditions as an AndExpression', () => {
		const matchingCondition = new TestExpression('matching');
		const remainingCondition1 = new TestExpression('remaining-1');
		const remainingCondition2 = new TestExpression('remaining-2');
		const event = new Event({
			type: 'played',
			name,
			shortForms: [
				{
					match: (expression) => expression === matchingCondition,
					description: shortDescription
				}
			]
		});

		const result = event.getTriggerDescription(
			new AndExpression(matchingCondition, remainingCondition1, remainingCondition2)
		);

		expect(result.description).toBe(shortDescription);
		expect(result.condition).toBeInstanceOf(AndExpression);
		expect((result.condition as AndExpression).operands).toEqual([
			remainingCondition1,
			remainingCondition2
		]);
	});

	it('returns the event name and preserves the original condition when no short form matches', () => {
		const condition = new TestExpression('unmatched');
		const event = new Event({
			type: 'played',
			name,
			shortForms: [
				{
					match: () => false,
					description: shortDescription
				}
			]
		});

		expect(event.getTriggerDescription(condition)).toEqual({
			description: name,
			condition
		});
	});
});
