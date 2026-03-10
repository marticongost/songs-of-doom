<!--
@component
Displays the list of disciplines unlocked by an archetype, showing each discipline's
icon and title.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		discipline: {
			display: 'inline-flex',
			gap: css.spacing.xs,
			alignItems: 'baseline',
			whiteSpace: 'nowrap'
		},
		icon: {
			color: css.text.highlightColor,
			height: '1.2em',
			alignSelf: 'center'
		}
	});
</script>

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
				<span class={styles.discipline}>
					<InlineSvg class={styles.icon} src="disciplines/{discipline.id}.svg" />
					<Text {...discipline.title} />
				</span>
			{/snippet}
		</TextList>
	</span>
{/if}
