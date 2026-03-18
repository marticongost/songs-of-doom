<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		symbol: {
			color: css.text.subtleColor
		},
		parameterItems: {
			'& > * + *:before': { content: '" "' }
		}
	});

	type SymbolType = 'parens' | 'angleBrackets';
	const symbols: Record<SymbolType, [string, string]> = {
		parens: ['(', ')'],
		angleBrackets: ['<', '>']
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		symbolType?: SymbolType;
		children: Snippet;
	}

	const { symbolType = 'parens', children, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes)}
	><!--
	--><span class={styles.symbol}>{symbols[symbolType][0]}</span><!--
	--><span
		class={styles.parameterItems}>{@render children()}</span
	><!--
	--><span class={styles.symbol}>{symbols[symbolType][1]}</span>
</span>
