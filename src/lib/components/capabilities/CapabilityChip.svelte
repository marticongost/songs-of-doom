<script lang="ts">
	import { Action } from '$lib/catalog/models/action';
	import type { Capability } from '$lib/catalog/models/capability';
	import { Reaction } from '$lib/catalog/models/reaction';
	import { standardAttributes } from '../standardattributes';
	import InlineSvg from '../InlineSvg.svelte';
	import EffectList from '../effects/EffectList.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import Parameters from './Parameters.svelte';
	import CapabilityCostChip from './CapabilityCostChip.svelte';
	import { scalarCapabilityCostTypes } from '$lib/catalog/models/capabilitycost';

	export let capability: Capability;
</script>

<div {...standardAttributes($$props, 'capability-chip')}>
	<div class="capability-activation">
		<!-- Capability type / triggers -->
		<div class="moment">
			{#if capability instanceof Action}
				<InlineSvg class="capability-icon" src="capabilities/action.svg" />
				<span class="trigger-label"><Text ca="Acció" es="Acción" en="Action" /></span>
			{:else if capability instanceof Reaction}
				<InlineSvg class="capability-icon" src="capabilities/reaction.svg" />
				<ul class="reaction-triggers">
					{#each capability.triggers as trigger}
						<li class="trigger-label"><Text {...trigger.name} /></li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Cost -->
		{#if !capability.cost.isFree()}
			<Parameters>
				{#each scalarCapabilityCostTypes as costType}
					{#if capability.cost.get(costType) !== 0}
						<span class="stat-cost">
							<CapabilityCostChip type={costType} />
							<span class="stat-value">{capability.cost.get(costType)}</span>
						</span>
					{/if}
				{/each}
				{#if capability.cost.cardTransition?.type === 'exhaust'}
					<CapabilityCostChip type="exhaust" />
				{/if}
				{#if capability.cost.cardTransition?.type === 'discard'}
					<CapabilityCostChip type="discard" />
				{/if}
			</Parameters>
		{/if}
	</div>

	<!-- Effects -->
	<EffectList style="flex: 1 1 auto; margin-left: 1.2em;" effects={capability.effects} />
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.capability-chip {
		@include rz.column(xs);
		align-items: stretch;
	}

	.capability-activation {
		@include rz.row;

		:global(.capability-icon) {
			margin-right: #{rz.size(xs)};
			color: var(--text-subtle-color);
		}
	}

	.moment {
		@include rz.row;
		margin-right: #{rz.size(xs)};
		color: var(--text-highlight);
	}

	.trigger-label {
		font-weight: bold;
	}

	.reaction-triggers {
		@include rz.row;

		li + li:before {
			content: ', ';
		}
	}
</style>
