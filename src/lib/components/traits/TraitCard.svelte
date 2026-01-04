<script lang="ts">
    import type { Trait } from '$lib/catalog/models/trait';
    import { getLocale } from '$lib/context/locale';
	import CapabilityList from '../capabilities/CapabilityList.svelte';
	import { standardAttributes } from '../standardattributes';
    const locale = getLocale();
    export let trait: Trait;
</script>

<style>
    .trait-card {
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 0.5rem;
    }

    h1 {
        font-family: var(--heading-font);
        font-size: 1.4rem;
        margin: 0;
        margin-bottom: 0.5rem;
    }
</style>


<article {...standardAttributes($$props, 'trait-card')}>
    <h1>{trait.title[locale]}</h1>
    <div class="description">{trait.description}</div>
    <CapabilityList capabilities={trait.capabilities} />
</article>