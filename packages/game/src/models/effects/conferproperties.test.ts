import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { MutableCardState } from '../game/cardstate';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import type { Property } from '../properties';
import { ConferPropertiesEffect, conferProperties } from './conferproperties';

// ─── ConferPropertiesEffect construction ─────────────────────────────────────

describe('ConferPropertiesEffect construction', () => {
	it('conferProperties(properties) creates an effect with those properties', () => {
		const property = mock<Property>();

		const effect = conferProperties([property]);

		expect(effect).toBeInstanceOf(ConferPropertiesEffect);
		expect(effect.properties).toEqual([property]);
	});

	it('conferProperties({ properties }) accepts the props object overload', () => {
		const property = mock<Property>();

		const effect = conferProperties({ properties: [property] });

		expect(effect).toBeInstanceOf(ConferPropertiesEffect);
		expect(effect.properties).toEqual([property]);
	});
});

// ─── ConferPropertiesEffect.apply ─────────────────────────────────────────────────

describe('ConferPropertiesEffect.apply', () => {
	it('adds a property that the implicit target does not already have', async () => {
		const grantedProperty = mock<Property>();
		const target = mock<MutableCardState>({ properties: [] });
		target.getProperty.calledWith(grantedProperty).mockReturnValue(undefined);
		const mutableState = mock<MutableGameState>();
		mutableState.requireTarget.mockReturnValue(target);
		const graph = mock<GameGraph>();
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await conferProperties([grantedProperty]).apply(graph);

		expect(target.properties).toEqual([grantedProperty]);
	});

	it('merges and replaces an already owned property', async () => {
		const grantedProperty = mock<Property>();
		const existingProperty = mock<Property>();
		const mergedProperty = mock<Property>();
		existingProperty.merge.calledWith(grantedProperty).mockReturnValue(mergedProperty);
		const target = mock<MutableCardState>({ properties: [existingProperty] });
		target.getProperty.calledWith(grantedProperty).mockReturnValue(existingProperty);
		const mutableState = mock<MutableGameState>();
		mutableState.requireTarget.mockReturnValue(target);
		const graph = mock<GameGraph>();
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await conferProperties([grantedProperty]).apply(graph);

		expect(target.properties).toEqual([mergedProperty]);
	});
});
