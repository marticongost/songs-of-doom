<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<style>
    .trait {
        padding: 1rem;
        border: 1px solid #ccc;
        width: 30rem;
    }

    h1 {
        font-family: var(--heading-font);
        font-size: 1.4rem;
        margin: 0;
        margin-bottom: 0.5rem;
    }
</style>

{#each Object.values(data.traits) as trait}
    <article class="trait">
        <h1>{trait.title}</h1>
        <div class="description">{trait.description}</div>
    </article>
{/each}