<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		capabilityChip: {
			...css.row('xs'),
			alignItems: 'flex-start'
		},
		capabilityIcon: {
			flex: '0 0 auto',
			position: 'relative',
			top: css.spacing.xs,
			color: css.text.subtleColor
		},
		capabilityCostParameters: {
			marginLeft: css.spacing.xs
		},
		moment: {
			fontWeight: 'bold',
			color: css.text.highlightColor
		},
		colon: {
			color: css.text.subtleColor
		},
		capabilityContent: {
			lineHeight: '1.5em'
		},
		capabilityEffects: {
			flex: '1 1 auto',
			marginLeft: '1.2em'
		}
	});
</script>

<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import type { Capability } from '@songsofdoom/game';
	import { Action, Constant, Reaction } from '@songsofdoom/game';
	import InlineSvg from '../InlineSvg.svelte';
	import EffectList from '../effects/EffectList.svelte';
	import EventTriggerChip from '../events/EventTriggerChip.svelte';
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
			if (capability.prioritary) {
				return 'capabilities/prioritary-action.svg';
			} else if (capability.fast) {
				return 'capabilities/fast-action.svg';
			} else {
				return 'capabilities/action.svg';
			}
		} else if (capability instanceof Constant) {
			return 'capabilities/constant.svg';
		} else if (capability instanceof Reaction) {
			const reaction = capability as Reaction;
			return `capabilities/${reaction.mandatory ? 'obligation' : 'opportunity'}.svg`;
		}
		return '';
	};
</script>

<div {...standardAttributes(attributes, styles.capabilityChip)}>
	<!-- Icon -->
	<InlineSvg class={styles.capabilityIcon} src={getIconSrc()} />

	<div class={styles.capabilityContent}>
		<span class={styles.capabilityActivation}>
			<!-- Moment -->
			<span class={styles.moment}>
				{#if capability instanceof Action}
					{#if capability.prioritary}
						<Text ca="Acció prioritària" es="Acción prioritaria" en="Prioritary action" />
					{:else if capability.fast}
						<Text ca="Acció ràpida" es="Acción rápida" en="Fast action" />
					{:else}
						<Text ca="Acció" es="Acción" en="Action" />
					{/if}
				{:else if capability instanceof Constant}
					<Text ca="Constant" es="Constante" en="Constant" />
				{:else if capability instanceof Reaction}
					{@const reaction = capability as Reaction}
					<TextList type="commas" items={reaction.triggers}>
						{#snippet entry(trigger)}
							<EventTriggerChip {trigger} />
						{/snippet}
					</TextList>
				{/if}
			</span><!--
				-->{#if !capability.cost.isFree()}<!--
					--><Parameters
					class={styles.capabilityCostParameters}
					><!--
						--><CapabilityCostList cost={capability.cost} /><!--
					--></Parameters
				><!--
				-->{/if}<!--
			--><span class={styles.colon}>:</span>
		</span>

		<!-- Effects -->
		<EffectList class={styles.capabilityEffects} effects={capability.effects} />
	</div>
</div>
