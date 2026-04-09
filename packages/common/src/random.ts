import type { Counter } from './counter';

/** Shuffle an array in place using the Fisher-Yates algorithm. */
export const shuffle = <T>(array: Array<T>): void => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
};

/** Selects a random item from a counter, weighted by their counts. */
export const weightedChoice = <T>(items: Counter<T>): T | undefined => {
	const totalWeight = items.totalCount();
	if (totalWeight === 0) {
		return undefined; // No items to choose from
	}
	let randomWeight = Math.random() * totalWeight;
	for (const [item, weight] of items.entries()) {
		if (randomWeight < weight) {
			return item;
		}
		randomWeight -= weight;
	}
	return undefined; // This should never happen if totalWeight > 0
};
