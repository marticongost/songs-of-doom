<script lang="ts">
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes } from '../standardattributes';

	export let charges: number;
</script>

<span {...standardAttributes($$props, 'charges-chip')}>
	<InlineSvg class="icon" src="capabilities/charge.svg" />
	<span class="label">{charges}</span>
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
</style>
