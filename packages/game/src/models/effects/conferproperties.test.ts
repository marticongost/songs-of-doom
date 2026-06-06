import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { Property } from '../properties';
import { conferProperties } from './conferproperties';

describe('ConferPropertiesEffect construction', () => {
	it('conferProperties(properties) creates an effect with those properties', () => {
		const property = mock<Property>();

		const effect = conferProperties([property]);

		expect(effect.properties).toEqual([property]);
	});

	it('conferProperties({ properties }) accepts the props object overload', () => {
		const property = mock<Property>();

		const effect = conferProperties({ properties: [property] });

		expect(effect.properties).toEqual([property]);
	});
});
