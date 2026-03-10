<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		focusChip: {
			...css.row('xs'),
			display: 'inline-flex',
			alignItems: 'baseline',
			...css.colorBindings.focus.rules('data-focus', (color) => ({ color }))
		},
		focusName: {
			fontWeight: 'bold'
		}
	});
</script>

<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { focuses, type Focus, type FocusType } from '@songsofdoom/game';
	import FocusIcon from './FocusIcon.svelte';

	interface Props extends StandardAttributeProps {
		focus: Focus | FocusType;
	}

	const { focus, ...attributes }: Props = $props();

	const focusObject = $derived(typeof focus === 'string' ? focuses[focus] : focus);
</script>

<span {...standardAttributes(attributes, styles.focusChip)} data-focus={focusObject.type}>
	<FocusIcon focus={focusObject} />
	<span class={styles.focusName}><Text {...focusObject.title} /></span>
</span>
