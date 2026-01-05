<script lang="ts">
    import { Action } from "$lib/catalog/models/action";
    import type { Capability } from "$lib/catalog/models/capability";
    import { Reaction } from "$lib/catalog/models/reaction";
    import { standardAttributes } from "../standardattributes";
    import { attributeTypes, statTypes, type StatType } from "$lib/catalog/models/stats";
	import InlineSvg from "../InlineSvg.svelte";
	import EffectList from "../effects/EffectList.svelte";
	import Text from "$lib/components/localisation/Text.svelte";

    export let capability: Capability;
</script>

<style lang="scss">
    @use "@reguitzell/styles" as rz;

    .capability-chip {
        @include rz.row(sm);
        align-items: flex-start;
    }

    .capability-activation {
        @include rz.row;

        :global(.capability-icon) {
            margin-right: #{rz.size(xs)};
            color: var(--text-subtle-color);
        }

         &:after {
            content: ":";
        }
    }

    .trigger-label {
        font-weight: bold;
    }

    .reaction-triggers {
        @include rz.row;

        li + li:before {
            content: ", ";
        }
    }

    .cost {
        margin-left: #{rz.size(sm)};

        &:before {
            content: "[";
            color: var(--text-subtle-color);
        }
        &:after {
            content: "]";
            color: var(--text-subtle-color);
        }
    }

    .capability-effects {
        flex: 1 1 auto;
    }
</style>

<div {...standardAttributes($$props, "capability-chip")}>

    <div class="capability-activation">

        <!-- Capability type / triggers -->
        {#if capability instanceof Action}
            <InlineSvg class="capability-icon" src="capabilities/action.svg" />
            <span class="trigger-label"><Text ca="Acció" es="Acción" en="Action"/></span>
        {:else if capability instanceof Reaction}
            <InlineSvg class="capability-icon" src="capabilities/reaction.svg" />
            <ul class="reaction-triggers">
                {#each capability.triggers as trigger}
                    <li class="trigger-label"><Text {...trigger.name}/></li>
                {/each}
            </ul>
        {/if}

        <!-- Cost -->
        {#if !capability.cost.isFree()}
            <div class="cost">
                {#each attributeTypes as attribute}
                    {#if capability.cost.get(attribute) !== 0}
                        <div class="stat-cost">
                            <InlineSvg src={`stats/${attribute}.svg`} class="stat" data-stat={attribute}/>
                            <span class="stat-value">{capability.cost.get(attribute)}</span>
                        </div>
                    {/if}
                {/each}
                {#if capability.cost.charges}
                    <div class="charges-cost">
                        <InlineSvg src="capabilities/charge.svg" class="charges-icon"/>
                        <span class="charge-value">{capability.cost.charges}</span>
                    </div>
                {/if}
                {#if capability.cost.exhaust}
                    <InlineSvg src="capabilities/exhaust.svg" class="exhaust-icon"/>
                {/if}
            </div>
        {/if}
    </div>

    <!-- Effects -->
    <EffectList style="flex: 1 1 auto;" effects={capability.effects} />
</div>