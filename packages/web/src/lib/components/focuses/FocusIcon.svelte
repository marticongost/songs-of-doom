<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		focusIcon: {
			alignSelf: 'center',
			borderRadius: '0.2em',
			width: '1.2em',
			height: '1.2em',
			filter: 'drop-shadow(0 0 0.8rem black)',
			...css.colorBindings.focus.rules('data-focus', (color) => ({ color }))
		},
		framedFocusIcon: {
			padding: '0.05em',
			backgroundColor: 'white',
			border: '1px solid currentColor'
		}
	});
</script>

<script lang="ts">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { cx } from '@emotion/css';
	import { focuses, type Focus, type FocusType } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		focus: Focus | FocusType;
		framed?: boolean;
	}

	const { focus, framed = true, ...attributes }: Props = $props();

	const focusObject = $derived(typeof focus === 'string' ? focuses[focus] : focus);
</script>

<InlineSvg
	{...standardAttributes(attributes, cx(styles.focusIcon, { [styles.framedFocusIcon]: framed }))}
	data-focus={focusObject.type}
	src={`${focusObject.stat ? 'stats' : 'focuses'}/${focusObject.type}.svg`}
/>
