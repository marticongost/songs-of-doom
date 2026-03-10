<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		capabilityList: {
			...css.column('sm'),
			alignItems: 'stretch'
		}
	});
</script>

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
	<ul {...standardAttributes(rest, styles.capabilityList)}>
		{#each capabilities as capability, i (i)}
			<li>
				<CapabilityChip {capability} />
			</li>
		{/each}
	</ul>
{/if}
