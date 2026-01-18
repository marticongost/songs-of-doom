<script lang="ts">
	import { svgs } from '$lib/assets/svg';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		src: string;
	}

	let { src, ...attributes }: Props = $props();

	// Inject attributes into the <svg> tag
	function decorate(raw: string, attrs: Record<string, any>): string {
		const attrString = Object.entries(attrs)
			.map(([k, v]) => `${k}="${v}"`)
			.join(' ');

		return raw.replace(/<svg([^>]*)>/, `<svg$1 ${attrString}>`);
	}

	const svg = $derived.by(() => {
		const attrs = standardAttributes(attributes, 'inline-svg');
		const rawSvg = svgs.get(src);
		return rawSvg ? decorate(rawSvg, attrs) : null;
	});
</script>

{#if svg}
	{@html svg}
{:else}
	<span class="inline-svg missing" data-src={src}></span>
{/if}

<style>
	:global(.inline-svg) {
		display: inline-block;
		width: auto;
		height: 1em;
		vertical-align: middle;
		fill: currentColor;
	}
	:global(.inline-svg.missing) {
		outline: 2px solid red;
	}
</style>
