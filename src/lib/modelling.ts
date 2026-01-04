export type Constructor<T, Props> = new (props: Props) => T;

// Wrap the conditional return type so the function stays readable
type Finalised<P, T> = P extends undefined ? undefined : T;

export const finalise = <T, Props, P extends T | Props | undefined>(
	model: Constructor<T, Props>,
	props: P
): Finalised<P, T> => {
	if (props === undefined) {
		return undefined as Finalised<P, T>;
	}

	if (props instanceof model) {
		return props as Finalised<P, T>;
	}

	return new model(props as Props) as Finalised<P, T>;
};
