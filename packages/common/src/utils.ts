import { BaseCounter } from './counter';

export type Constructor<T, Props> = new (props: Props) => T;

// Wrap the conditional return type so the function stays readable
type Finalised<P, T> = P extends undefined ? undefined : T;

export const finalise = <
	T,
	C extends abstract new (...args: never[]) => T,
	P extends T | ConstructorParameters<C>[0] | undefined
>(
	model: C,
	props: P
): Finalised<P, T> => {
	if (props === undefined) {
		return undefined as Finalised<P, T>;
	}

	if (props instanceof model) {
		return props as Finalised<P, T>;
	}

	return new (model as unknown as Constructor<T, ConstructorParameters<C>[0]>)(
		props as ConstructorParameters<C>[0]
	) as Finalised<P, T>;
};

export type MapToRecordOptions<
	InputKey,
	InputValue,
	OutputKey extends string | number | symbol,
	OutputValue
> = {
	mapKeys?: (key: InputKey) => OutputKey;
	mapValues?: (value: InputValue) => OutputValue;
	mapEntries?: (entry: [InputKey, InputValue]) => [OutputKey, OutputValue];
};

/** Converts a `Map` or `Record` into another `Record`, optionally mapping its keys
 * and/or values in the process.
 */
export const mapToRecord = <
	InputKey,
	InputValue,
	OutputKey extends string | number | symbol,
	OutputValue
>(
	source:
		| Map<InputKey, InputValue>
		| BaseCounter<InputKey>
		| Record<string | number | symbol, InputValue>,
	options: MapToRecordOptions<InputKey, InputValue, OutputKey, OutputValue>
): Record<OutputKey, OutputValue> => {
	const record = {} as Record<OutputKey, OutputValue>;
	const entries: Iterable<[InputKey, InputValue]> =
		source instanceof BaseCounter
			? (source.entries() as Iterable<[InputKey, InputValue]>)
			: source instanceof Map
				? source.entries()
				: (Object.entries(source) as [InputKey, InputValue][]);
	for (const [key, value] of entries) {
		if (options.mapEntries) {
			const [outputKey, outputValue] = options.mapEntries([key, value]);
			record[outputKey] = outputValue;
		} else {
			const k = options.mapKeys ? options.mapKeys(key) : (key as unknown as OutputKey);
			const v = options.mapValues ? options.mapValues(value) : (value as unknown as OutputValue);
			record[k] = v;
		}
	}
	return record;
};

/** Group a collection of values by the given key. */
export const groupBy = <K, V>(values: Array<V>, getKey: (value: V) => K): Map<K, Array<V>> => {
	const map = new Map<K, Array<V>>();
	for (const value of values) {
		const key = getKey(value);
		const group = map.get(key);
		if (group) {
			group.push(value);
		} else {
			map.set(key, [value]);
		}
	}
	return map;
};
