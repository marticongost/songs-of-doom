<script lang="ts">
	const { children } = $props();
</script>

<div class="manual">
	{@render children()}
</div>

<style lang="scss">
	.manual {
		:global(h1) {
			font-family: var(--heading-font);
			font-size: 2.5rem;
			margin-bottom: 1rem;
		}
	}
</style>
