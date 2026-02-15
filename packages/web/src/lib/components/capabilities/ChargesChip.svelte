<script lang="ts">
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		charges: number;
	}

	const { charges, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'charges-chip')}>
	<InlineSvg class="icon" src="capabilities/charge.svg" />
	<span class="label">{charges}</span>
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
</style>
