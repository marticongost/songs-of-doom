import { getLocale } from '$lib/context/locale';
import { intlLocaleMap } from '$lib/localisation';
import { Column, type ColumnProps } from './column';

/**
 * Constructor parameters for {@link DateColumn}.
 */
export interface DateColumnProps<T> extends ColumnProps<T, Date> {
	/** Date format style. Defaults to 'medium'. */
	dateStyle?: 'short' | 'medium' | 'long' | 'full';

	/** Whether to include time. Defaults to false. */
	includeTime?: boolean;
}

/**
 * Column for Date values. Formats dates according to locale conventions.
 */
export class DateColumn<T> extends Column<T, Date> {
	readonly dateStyle: 'short' | 'medium' | 'long' | 'full';
	readonly includeTime: boolean;

	constructor(config: DateColumnProps<T>) {
		super({ ...config, align: config.align ?? 'left' });
		this.dateStyle = config.dateStyle ?? 'medium';
		this.includeTime = config.includeTime ?? false;
	}

	formatValue(value: Date): string {
		if (!value || !(value instanceof Date) || isNaN(value.getTime())) {
			return '';
		}
		const options: Intl.DateTimeFormatOptions = { dateStyle: this.dateStyle };
		if (this.includeTime) {
			options.timeStyle = 'short';
		}
		const locale = getLocale();
		return new Intl.DateTimeFormat(intlLocaleMap[locale], options).format(value);
	}
}
