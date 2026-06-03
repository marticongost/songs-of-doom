<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		capabilityList: {
			...css.column('sm'),
			alignItems: 'stretch'
		},
		nested: {
			display: 'inline',
			li: {
				display: 'inline'
			}
		}
	});

	const reactionHasSingleEffectWithDefaultEvent = (capability: Capability): boolean => {
		return (
			capability instanceof Reaction &&
			capability.triggers.length === 1 &&
			capability.effects.length === 1 &&
			capability.triggers[0].event.type === capability.effects[0].defaultEvent
		);
	};
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import { Reaction, type Capability } from '@songsofdoom/game';
	import EffectChip from '../effects/EffectChip.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import CapabilityChip from './CapabilityChip.svelte';

	interface Props extends StandardAttributeProps {
		capabilities: Array<Capability>;
		nested?: boolean;
	}

	const { capabilities, nested = false, ...rest }: Props = $props();
</script>

{#if capabilities.length > 0}
	<ul {...standardAttributes(rest, cx(styles.capabilityList, nested && styles.nested))}>
		{#each capabilities as capability, i (i)}
			<li>
				{#if nested && reactionHasSingleEffectWithDefaultEvent(capability)}
					<EffectChip effect={capability.effects[0]} />{#if i < capabilities.length - 1}{', '}{/if}
				{:else}
					<CapabilityChip {capability} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
