<script lang="ts">
    import type { Entity } from '$lib/catalog/models/entity';
	import CapabilityList from '$lib/components/capabilities/CapabilityList.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { standardAttributes } from '$lib/components/standardattributes';
	import InlineSvg from './InlineSvg.svelte';
    export let entity: Entity;
</script>

<style lang="scss">
    @use "@reguitzell/styles" as rz;

    .header {
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

    .card {
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

    .properties {
        @include rz.row(sm);
        font-style: italic;
    }
</style>

<article {...standardAttributes($$props, 'card')}>
    <div class="header">
        {#if entity.isArchetype}
           <InlineSvg class="own-archetype-icon" src="archetypes/{entity.id}.svg"/>
        {/if}
        <h1><Text {...entity.title}/></h1>
        {#if entity.archetype}
            <InlineSvg class="required-archetype-icon" src="archetypes/{entity.archetype.id}.svg"/>
        {/if}
    </div>
    {#if entity.properties.length}
        <ul class="properties">
            {#each entity.properties as property}
                <li><Text {...property.title}/></li>
            {/each}
        </ul>
    {/if}
    <div class="description">{entity.description}</div>
    <CapabilityList capabilities={entity.capabilities} />
</article>