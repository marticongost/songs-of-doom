<script lang="ts">
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	const { ...attributes }: StandardAttributeProps = $props();
</script>

<InlineSvg {...standardAttributes(attributes, 'arrow-icon')} src="arrow.svg" />

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.arrow-icon) {
		color: var(--text-subtle-color);
		width: 1em;
	}
</style>
