import { getLocale } from '$lib/context/locale';
import { translate, type LocalisedText } from '@songsofdoom/common/localisation';
import { Column, type ColumnProps } from './column';

/**
 * Constructor parameters for {@link BooleanColumn}.
 */
export interface BooleanColumnProps<T> extends ColumnProps<T, boolean> {
	trueLabel?: LocalisedText;
	falseLabel?: LocalisedText;
}

/**
 * Column for boolean values.
 * Displays localised yes/no or custom labels.
 * Center-aligned by default.
 */
export class BooleanColumn<T> extends Column<T, boolean> {
	static readonly defaultTrueLabel: LocalisedText = { ca: 'Sí', es: 'Sí', en: 'Yes' };
	static readonly defaultFalseLabel: LocalisedText = { ca: 'No', es: 'No', en: 'No' };

	readonly trueLabel: LocalisedText;
	readonly falseLabel: LocalisedText;

	constructor(config: BooleanColumnProps<T>) {
		super({ ...config, align: config.align ?? 'center' });
		this.trueLabel = config.trueLabel ?? BooleanColumn.defaultTrueLabel;
		this.falseLabel = config.falseLabel ?? BooleanColumn.defaultFalseLabel;
	}

	override formatValue(value: boolean): string {
		const locale = getLocale();
		return translate(value ? this.trueLabel : this.falseLabel, locale);
	}
}
