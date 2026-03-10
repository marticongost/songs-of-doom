<!--
@component
Displays a talent name with appropriate styling.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		talentChip: {
			fontWeight: 'bold',
			color: css.colorBindings.talentColor
		}
	});
</script>

<script lang="ts">
	import type { Talent } from '@songsofdoom/game';

	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		/** The talent to display. */
		talent: Talent;
	}

	const { talent, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.talentChip)}>
	<Text {...talent.title} />
</span>
