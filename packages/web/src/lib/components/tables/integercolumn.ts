import { getLocale } from '$lib/context/locale';
import { intlLocaleMap, locales, type Locale } from '@songsofdoom/common/localisation';
import { Column, type ColumnProps } from './column';

const integerFormats = {} as Record<Locale, Intl.NumberFormat>;
for (const locale of locales) {
	integerFormats[locale] = new Intl.NumberFormat(intlLocaleMap[locale], {
		maximumFractionDigits: 0
	});
}

/**
 * Column for integer values.
 */
export class IntegerColumn<T> extends Column<T, number> {
	constructor({ align = 'right', ...rest }: ColumnProps<T, number>) {
		super({ align, ...rest });
	}

	formatValue(value: number): string {
		const locale = getLocale();
		return integerFormats[locale].format(value);
	}
}
