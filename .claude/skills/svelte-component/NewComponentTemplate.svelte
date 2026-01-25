<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		prop1: x;
		prop2: y;
	}

	const { prop1, prop2, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, 'css-class-name-for-the-component')}></div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
</style>
