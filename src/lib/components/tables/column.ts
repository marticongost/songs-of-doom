import type { LocalisedText } from '$lib/localisation';
import type { Snippet } from 'svelte';

/** Alignment options for table columns. */
export type ColumnAlignment = 'left' | 'center' | 'right';

/**
 * Constructor parameters for {@link Column}.
 */
export interface ColumnProps<T, V = unknown> {
	/** Column header text (localised) */
	header: LocalisedText;

	/** Function to extract the cell value from a row */
	expression: string | ((row: T) => V | undefined);

	/** Text alignment: 'left' | 'center' | 'right'. Defaults vary by column type. */
	align?: ColumnAlignment;

	/** Custom snippet to render the cell content */
	snippet?: Snippet<[column: Column<T, V>, value: V, row: T]>;
}

/**
 * Base class for table columns.
 * Columns define how to extract and configure cell data from rows. They also control
 * the rendering, via {@link ColumnProps.snippet} or by overriding
 * {@link Column.formatValue} and {@link Column.formatUndefined}.
 *
 * @template T - The row data type
 * @template V - The cell value type extracted by the expression
 */
export abstract class Column<T, V = unknown> {
	readonly header: LocalisedText;
	readonly expression: (row: T) => V | undefined;
	readonly align: ColumnAlignment;
	readonly snippet?: Snippet<[column: Column<T, V>, value: V, row: T]>;

	constructor(props: ColumnProps<T, V>) {
		this.header = props.header;
		this.expression =
			typeof props.expression === 'function'
				? props.expression
				: (row: T) => row[props.expression as keyof T] as V | undefined;
		this.align = props.align ?? 'left';
		this.snippet = props.snippet;
	}

	getValue(row: T): V | undefined {
		return this.expression(row);
	}

	getTextContentForCell(row: T): string {
		const value = this.getValue(row);
		if (value === undefined) {
			return this.formatUndefined(row);
		}
		return this.formatValue(value);
	}

	formatValue(value: V): string {
		return String(value);
	}

	formatUndefined(_row: T): string {
		return '';
	}
}
