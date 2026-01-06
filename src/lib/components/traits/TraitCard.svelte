<script lang="ts">
    import type { Trait } from '$lib/catalog/models/trait';
    import { getLocale } from '$lib/context/locale';
	import CapabilityList from '$lib/components/capabilities/CapabilityList.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { standardAttributes } from '$lib/components/standardattributes';
	import InlineSvg from '../InlineSvg.svelte';
    const locale = getLocale();
    export let trait: Trait;
</script>

<style lang="scss">
    @use "@reguitzell/styles" as rz;

    .card-header {
        @include rz.row(sm);

        :global(.own-archetype-icon) {
            flex: 0 0 auto;
            height: 1.8rem;
        }

        :global(.required-archetype-icon) {
            flex: 0 0 auto;
            height: 1.5rem;
            color: var(--text-subtle-color);
        }
    }

    .trait-card {
        @include rz.column(sm);
        align-items: stretch;
        width: 30rem;
        padding: 1rem;
        border: var(--panel-border);
        border-radius: 0.5rem;
        background-color: var(--panel-background-color);
    }

    h1 {
        font-family: var(--heading-font);
        font-size: 1.4rem;
        color: var(--text-heading-color);
        margin-right: auto;
    }

    .details {
        font-style: italic;
    }
</style>

<article {...standardAttributes($$props, 'trait-card')}>
    <div class="card-header">
        {#if trait.isArchetype}
           <InlineSvg class="own-archetype-icon" src="archetypes/{trait.id}.svg"/>
        {/if}
        <h1>{trait.title[locale]}</h1>
        {#if trait.archetype}
            <InlineSvg class="required-archetype-icon" src="archetypes/{trait.archetype.id}.svg"/>
        {/if}
    </div>
    {#if trait.archetype || trait.properties.length}
        <div class="details">
            {#if trait.archetype}
            <div class="archetype">
                    <strong><Text ca="Arquetip:" es="Arquetipo:" en="Archetype:"/></strong>
                    <Text {...trait.archetype.title}/>
                </div>
            {/if}
        </div>
    {/if}
    <div class="description">{trait.description}</div>
    <CapabilityList capabilities={trait.capabilities} />
</article>