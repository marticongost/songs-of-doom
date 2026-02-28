<script lang="ts">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	const { ...attributes }: StandardAttributeProps = $props();
</script>

<InlineSvg {...standardAttributes(attributes, 'gold-icon')} src="gold.svg" />

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.gold-icon) {
		align-self: center;
		width: 1.2em;
		height: 1.2em;
		color: var(--gold-background-color);
	}
</style>
