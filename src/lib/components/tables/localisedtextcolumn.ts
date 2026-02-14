import { getLocale } from '$lib/context/locale';
import { translate, type LocalisedText } from '$lib/localisation';
import { Column } from './column';

/**
 * Column for LocalisedText values.
 */
export class LocalisedTextColumn<T> extends Column<T, LocalisedText> {
	formatValue(value: LocalisedText): string {
		const locale = getLocale();
		return translate(value, locale);
	}
}
