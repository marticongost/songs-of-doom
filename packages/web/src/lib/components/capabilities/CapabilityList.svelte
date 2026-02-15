<script lang="ts">
	import type { Capability } from '@songsofdoom/game';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import CapabilityChip from './CapabilityChip.svelte';

	interface Props extends StandardAttributeProps {
		capabilities: Array<Capability>;
	}

	const { capabilities, ...rest }: Props = $props();
</script>

{#if capabilities.length > 0}
	<ul {...standardAttributes(rest, 'capability-list')}>
		{#each capabilities as capability, i (i)}
			<li>
				<CapabilityChip {capability} />
			</li>
		{/each}
	</ul>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	.capability-list {
		@include rz.column(sm);
		align-items: stretch;
	}
</style>
