<script>
	import { standardAttributes } from './standardattributes';
</script>

<blockquote {...standardAttributes($$props, 'block-quote')}>
	<slot />
</blockquote>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	blockquote {
		margin: 0;
		margin-top: rz.size(sm);
		@include rz.vpadding(xs);
		padding-left: rz.size(md);
		border-left: 4px solid var(--text-subtle-color);
	}
</style>
