<script lang="ts">
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes } from './standardattributes';

	export let amount: number;
</script>

<span {...standardAttributes($$props, 'xp-chip')}>
	<span class="amount">{amount}</span>
	<InlineSvg class="icon" src="experience.svg" />
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	$size: 1.2em;

	.xp-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: $size;
		height: $size;
		position: relative;

		:global(.icon) {
			position: absolute;
			left: 0;
			top: 0.1em;
			color: var(--experience-background-color);
			height: #{$size};
			width: #{$size};
		}
	}

	.amount {
		position: relative;
		z-index: 1;
		font-weight: bold;
		color: var(--experience-foreground-color);
	}
</style>
