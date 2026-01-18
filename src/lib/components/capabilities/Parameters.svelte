<script lang="ts" module>
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

<span {...standardAttributes(attributes, 'parameters')}>
	<span class="symbol">{symbols[symbolType][0]}</span>
	<span class="parameter-items">
		{@render children()}
	</span>
	<span class="symbol">{symbols[symbolType][1]}</span>
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.parameter-items > * + *) {
		margin-left: rz.size(sm);
	}

	.symbol {
		color: var(--text-subtle-color);
	}
</style>
