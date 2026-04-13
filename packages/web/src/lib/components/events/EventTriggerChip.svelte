<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		condition: {
			fontWeight: 'normal',
			color: css.text.regularColor
		}
	});
</script>

<!--
@component
Renders a reaction trigger event label.
Use this when displaying a single trigger inside capability UIs.
-->
<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import type { EventTrigger } from '@songsofdoom/game';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Instruction from '../structured-text/Instruction.svelte';

	interface Props extends StandardAttributeProps {
		/** Trigger to render. */
		trigger: EventTrigger;
	}

	const { trigger, ...attributes }: Props = $props();
	const { description, condition } = $derived(
		trigger.event.getTriggerDescription(trigger.condition)
	);
</script>

<span {...standardAttributes(attributes)}>
	<Text {...description} />
	{#if condition}
		<span class={styles.condition}>
			<Instruction><Text ca="Si" es="Si" en="If" /></Instruction>
			<Parameters><ExpressionChip expression={condition} /></Parameters>
		</span>
	{/if}
</span>
