<script lang="ts">
    import { standardAttributes } from '$lib/components/standardattributes';
    import { svgs } from '$lib/svg';

    // Props
    export let src: string;

    let svg: string | null = null;

    // Inject attributes into the <svg> tag
    function decorate(raw: string, attrs: Record<string, any>): string {
        const attrString = Object.entries(attrs)
            .map(([k, v]) => `${k}="${v}"`)
            .join(' ');

        return raw.replace(
            /<svg([^>]*)>/,
            `<svg$1 ${attrString}>`
        );
    }

    $: {
        const attrs = standardAttributes($$props, "inline-svg");
        const rawSvg = svgs.get(src);
        svg = rawSvg ? decorate(rawSvg, attrs) : null;
    }
</script>

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

{#if svg}
    {@html svg}
{:else}
    <span class="inline-svg missing" data-src={src}></span>
{/if}
