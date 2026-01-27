<script lang="ts">
	import { Action } from '$lib/catalog/models/action';
	import type { Capability } from '$lib/catalog/models/capability';
	import { Reaction } from '$lib/catalog/models/reaction';
	import Text from '$lib/components/localisation/Text.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import EffectList from '../effects/EffectList.svelte';
	import TextList from '../localisation/TextList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import CapabilityCostList from './CapabilityCostList.svelte';
	import Parameters from './Parameters.svelte';

	interface Props extends StandardAttributeProps {
		capability: Capability;
	}

	const { capability, ...attributes }: Props = $props();
	const getIconSrc = () => {
		if (capability instanceof Action) {
			return 'capabilities/action.svg';
		} else if (capability instanceof Reaction) {
			const reaction = capability as Reaction;
			return `capabilities/${reaction.mandatory ? 'obligation' : 'opportunity'}.svg`;
		}
		return '';
	};
</script>

<div {...standardAttributes(attributes, 'capability-chip')}>
	<!-- Icon -->
	<InlineSvg class="capability-icon" src={getIconSrc()} />

	<div class="capability-content">
		<span class="capability-activation">
			<!-- Moment -->
			<span class="moment">
				{#if capability instanceof Action}
					<Text ca="Acció" es="Acción" en="Action" />
				{:else if capability instanceof Reaction}
					{@const reaction = capability as Reaction}
					<TextList type="commas" items={reaction.triggers}>
						{#snippet entry(trigger)}
							<Text {...trigger.name} />
						{/snippet}
					</TextList>
				{/if}
			</span><!--
				-->{#if !capability.cost.isFree()}<!--
					--><Parameters
					class="capability-cost-parameters"
					><!--
						--><CapabilityCostList cost={capability.cost} /><!--
					--></Parameters
				><!--
				-->{/if}<!--
			--><span class="colon">:</span>
		</span>

		<!-- Effects -->
		<EffectList style="flex: 1 1 auto; margin-left: 1.2em;" effects={capability.effects} />
	</div>
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.capability-chip {
		@include rz.row(xs);
		align-items: flex-start;

		:global(.capability-icon) {
			flex: 0 0 auto;
			position: relative;
			top: rz.size(xs);
			color: var(--text-subtle-color);
		}

		:global(.capability-cost-parameters) {
			margin-left: #{rz.size(xs)};
		}
	}

	.capability-activation {
		font-weight: bold;
	}

	.moment {
		color: var(--text-highlight);
	}

	.colon {
		color: var(--text-subtle-color);
	}

	.capability-content {
		line-height: 1.5em;
	}
</style>
