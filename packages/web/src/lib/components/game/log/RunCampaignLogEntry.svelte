<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		entry: {}
	});
</script>

<script lang="ts">
	import EntityLink from '$lib/components/EntityLink.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { RunCampaignState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: RunCampaignState;
	}

	const { state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text
		ca="Iniciant la campanya %(name)"
		es="Iniciando la campaña %(name)"
		en="Starting campaign %(name)"
	>
		{#snippet name()}
			<EntityLink entity={state.campaignId!} target="_blank" />
		{/snippet}
	</Text>
</div>
