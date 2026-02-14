<!--
@component
A reusable table component with configurable columns.

Supports preset column types (string, LocalisedText, integer, boolean, date)
with automatic formatting. Custom columns can extend the base Column class
and provide rendering via their `snippet` property or by overriding their `formatValue`
method.

@example
```svelte
<script lang="ts" module>
	class CoordinatesColumn <T> extends Column<T, Coordinates> {
		override formatValue(row: T, value: Coordinates): string {
			return `${value.lat}, ${value.lng}`;
		}
	}
</script>
<Table
  rows={users}
  columns={[
    new StringColumn({ header: { en: 'Name' }, expression: "name"}),
	new IntegerColumn({ header: { en: 'Age' }, expression: "age" }),
	new CoordinatesColumn({ header: { en: 'Location' }, expression: (u) => u.getLastKnownLocation() })
  ]}
</Table>
```
-->
<script lang="ts" generics="T">
	import { getLocale } from '$lib/context/locale';
	import { translate } from '$lib/localisation';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import { type Column } from './column';

	interface Props extends StandardAttributeProps {
		/** Array of row data objects */
		rows: T[];

		/** Column definitions - instances of Column subclasses */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		columns: Column<T, any>[];

		/** Whether to show a header row. Defaults to true. */
		showHeader?: boolean;

		/** Whether to stripe alternating rows. Defaults to true. */
		striped?: boolean;

		/** Row click handler. */
		onClickRow?: (row: T) => void;
	}

	const {
		rows,
		columns,
		showHeader = true,
		striped = true,
		onClickRow,
		...attributes
	}: Props = $props();

	const locale = getLocale();
	const hoverable = $derived(onClickRow !== undefined);
</script>

<table {...standardAttributes(attributes, 'table')} class:striped class:hoverable>
	{#if showHeader}
		<thead>
			<tr>
				{#each columns as column, index (index)}
					<th style:text-align={column.align}>
						{translate(column.header, locale)}
					</th>
				{/each}
			</tr>
		</thead>
	{/if}

	<tbody>
		{#each rows as row, rowIndex (rowIndex)}
			<tr onclick={() => onClickRow?.(row)}>
				{#each columns as column, colIndex (colIndex)}
					{@const value = column.getValue(row)}
					<td style:text-align={column.align}>
						{#if column.snippet}
							{@render column.snippet(column, value, row)}
						{:else}
							{column.getTextContentForCell(row)}
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.table {
		width: 100%;
		border-collapse: collapse;
		font-size: inherit;

		th,
		td {
			@include rz.vpadding(sm);
			@include rz.hpadding(md);
			vertical-align: middle;
		}

		th {
			font-weight: bold;
			color: var(--table-heading-color);
			border-bottom: var(--table-heading-separator);
			text-align: left;
		}

		tbody tr {
			background-color: var(--table-background-color);
		}

		&.striped tbody tr:nth-child(even) {
			background-color: var(--table-stripe-background-color);
		}

		&.hoverable tbody tr {
			cursor: pointer;

			&:hover {
				background-color: var(--table-hover-background-color);
			}
		}
	}
</style>
