<script lang="ts">
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		charges: number;
	}

	const { charges, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes)}>
	<InlineSvg src="capabilities/charge.svg" />
	<span>{charges}</span>
</span>
