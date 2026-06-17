<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		root: {
			...css.column('sm')
		},
		paragraph: {
			margin: 0,
			fontStyle: 'italic',
			fontFamily: css.fonts.heading,
			color: css.palette.silk
		}
	});
</script>

<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';
	import { translate } from '@songsofdoom/common/localisation';
	import { NarrationEffect } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		effect: NarrationEffect;
	}

	const { effect, ...attributes }: Props = $props();

	const locale = getLocale();

	const paragraphs = $derived(
		translate(effect.text, locale)
			.split(/\n+/)
			.filter((p) => p.trim().length > 0)
	);
</script>

<div {...standardAttributes(attributes, styles.root)}>
	{#each paragraphs as paragraph (paragraph)}
		<p class={styles.paragraph}>{paragraph}</p>
	{/each}
</div>
