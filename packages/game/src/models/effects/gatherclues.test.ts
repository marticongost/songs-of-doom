import { describe, expect, it } from 'vitest';
import { currentLocation, Target } from '../target';
import { gatherClues } from './gatherclues';

describe('GatherCluesEffect construction', () => {
	it('gatherClues(amount) creates an effect with that amount and the current location as target', () => {
		const effect = gatherClues(3);
		expect(effect.amount).toBe(3);
		expect(effect.target).toBe(currentLocation);
	});

	it('gatherClues({ amount, target }) creates an effecth with the given amount and target', () => {
		const target = new Target({ type: 'location' });
		const effect = gatherClues({ amount: 1, target });
		expect(effect.amount).toBe(1);
		expect(effect.target).toBe(target);
	});
});
