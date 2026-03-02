<!--
@component
Displays the list of disciplines unlocked by an archetype, showing each discipline's
icon and title.
-->
<script lang="ts">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { Discipline } from '@songsofdoom/game';
	import TextList from '../localisation/TextList.svelte';

	interface Props extends StandardAttributeProps {
		/** @prop The list of disciplines to display */
		disciplines: Array<Discipline>;
	}

	const { disciplines, ...attributes }: Props = $props();
</script>

{#if disciplines.length}
	<span {...standardAttributes(attributes, 'discipline-list')}>
		<TextList items={disciplines} type="commas">
			{#snippet entry(discipline)}
				<span class="discipline">
					<InlineSvg class="discipline-icon" src="disciplines/{discipline.id}.svg" />
					<Text {...discipline.title} />
				</span>
			{/snippet}
		</TextList>
	</span>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.discipline {
		display: inline-flex;
		gap: rz.size(xs);
		align-items: baseline;
		white-space: nowrap;
		--svg-color: var(--text-highlight);

		:global(.discipline-icon) {
			height: 1.2em;
			align-self: center;
		}
	}
</style>
