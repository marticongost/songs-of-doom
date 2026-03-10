<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		inlineSvg: {
			display: 'inline-block',
			width: 'var(--svg-width, auto)',
			height: 'var(--svg-height, 1em)',
			verticalAlign: 'middle',
			fill: 'var(--svg-color, currentColor)'
		},
		missing: {
			outline: '2px solid red'
		}
	});
</script>

<script lang="ts">
	import { svgs } from '$lib/assets/svg';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { cx } from '@emotion/css';

	interface Props extends StandardAttributeProps {
		src: string;
	}

	let { src, ...attributes }: Props = $props();

	// Inject attributes into the <svg> tag
	function decorate(raw: string, attrs: Record<string, unknown>): string {
		const attrString = Object.entries(attrs)
			.map(([k, v]) => `${k}="${v}"`)
			.join(' ');

		return raw.replace(/<svg([^>]*)>/, `<svg$1 ${attrString}>`);
	}

	const svg = $derived.by(() => {
		const attrs = standardAttributes(attributes, styles.inlineSvg);
		const rawSvg = svgs.get(src);
		return rawSvg ? decorate(rawSvg, attrs) : null;
	});
</script>

{#if svg}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- Rendering trusted SVG from internal asset map -->
	{@html svg}
{:else}
	<span class={cx(styles.inlineSvg, styles.missing)} data-src={src}></span>
{/if}
