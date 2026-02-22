import { Character, CharacterRevision } from '$lib/models/characters';
import { User } from '$lib/models/user';
import type { Constructor } from '@songsofdoom/common';
import { CharacterState } from '@songsofdoom/game';

/** Recursively converts values into JSON-serialisable forms, including Maps and Dates. */
const toSerializableData = (value: unknown): unknown => {
	if (value instanceof Date) {
		return { $date: value.toISOString() };
	}
	if (value instanceof Map) {
		return Object.fromEntries(
			[...value.entries()].map(([k, v]) => [
				typeof k === 'object' && k !== null && 'id' in k ? k.id : k,
				toSerializableData(v)
			])
		);
	}
	if (Array.isArray(value)) {
		return value.map(toSerializableData);
	}
	if (typeof value === 'object' && value !== null) {
		return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toSerializableData(v)]));
	}
	return value;
};

/** Type guard for date marker objects. */
const isDateMarker = (value: unknown): value is { $date: string } =>
	typeof value === 'object' && value !== null && '$date' in value;

/** Recursively converts a value from its serialisable form back to its original form, including Date instances. */
const fromSerializableData = (value: unknown): unknown => {
	if (isDateMarker(value)) {
		return new Date(value.$date);
	}
	if (Array.isArray(value)) {
		return value.map(fromSerializableData);
	}
	if (typeof value === 'object' && value !== null) {
		return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fromSerializableData(v)]));
	}
	return value;
};

const createTransporter = <T, Props extends object>(type: Constructor<T, Props>) => ({
	encode: (value: T): Props | false => {
		if (!(value instanceof type)) return false;
		return toSerializableData(value) as Props;
	},
	decode: (props: Props): T => {
		const restored = fromSerializableData(props) as Props;
		return new type(restored);
	}
});

/**
 * SvelteKit transport hook for serialising custom types across the server/client boundary.
 * @see https://svelte.dev/docs/kit/hooks#Universal-hooks-transport
 */
export const transport = {
	User: createTransporter(User),
	CharacterState: createTransporter(CharacterState),
	CharacterRevision: createTransporter(CharacterRevision),
	Character: createTransporter(Character)
};
