export const locales = ['ca', 'es', 'en'] as const;

export type Locale = (typeof locales)[number];

export type LocalisedText = Partial<Record<Locale, string>>;

type LocalisedKeys<T> = { [K in keyof T]: T[K] extends LocalisedText ? K : never }[keyof T];

export type SingleLocale<T, K extends LocalisedKeys<T>> = {
	[P in keyof T]: P extends K ? string : T[P];
};

export const getLocalisedField = <T, K extends keyof T & string>(
	object: T & Record<K, LocalisedText>,
	field: K,
	locale: Locale
): string | undefined => {
	return object[field] && object[field][locale];
};

export const requireLocalisedField = <T, K extends keyof T & string>(
	object: T & Record<K, LocalisedText>,
	field: K,
	locale: Locale
): string => {
	const fieldValue = object[field];
	if (!fieldValue) {
		throw new Error(`Missing field '${field}' in ${JSON.stringify(object)}`);
	}
	const value = fieldValue[locale];
	if (!value) {
		throw new Error(`Missing locale '${locale}' for field '${field}' in ${JSON.stringify(object)}`);
	}
	return value;
};

export function toSingleLocale<T, L extends Locale, K extends readonly LocalisedKeys<T>[]>(
	object: T,
	fields: K,
	locale: L
): SingleLocale<T, K[number]> {
	const result = { ...object } as SingleLocale<T, K[number]>;
	for (const field of fields) {
		const value = object[field];
		if (!isLocalisedText(value)) {
			throw new Error(`Field '${String(field)}' is not LocalisedText in ${JSON.stringify(object)}`);
		}

		// TS can't prove this, but logically:
		// - field ∈ K[number]
		// - result[field] is string in SingleLocale
		// - value[locale] is string
		result[field] = value[locale] as unknown as SingleLocale<T, K[number]>[typeof field];
	}
	return result;
}

const isLocalisedText = (value: unknown): value is LocalisedText => {
	return (
		typeof value === 'object' &&
		value !== null &&
		locales.find((locale) => locale in value) !== undefined
	);
};

export const plural2 = (n: number, singular: string, plural: string): string => {
	return n === 1 ? singular : plural;
};

export const translate = (localisedText: LocalisedText, locale: Locale): string => {
	return localisedText[locale] || '';
};

export const caPossessive = (text: string): string => {
	if (!text) return '';

	const firstChar = text[0].toLowerCase();
	const vowels = ['a', 'e', 'i', 'o', 'u', 'à', 'è', 'é', 'í', 'ò', 'ó', 'ú'];

	if (vowels.includes(firstChar)) {
		return `d'${text}`;
	}

	return `de ${text}`;
};
