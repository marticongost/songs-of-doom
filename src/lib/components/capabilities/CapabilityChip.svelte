<script lang="ts">
    import { Action } from "$lib/catalog/models/action";
    import type { Capability } from "$lib/catalog/models/capability";
    import { Reaction } from "$lib/catalog/models/reaction";
    import { standardAttributes } from "../standardattributes";
    import { attributeTypes, statTypes, type StatType } from "$lib/catalog/models/stats";
	import InlineSvg from "../InlineSvg.svelte";
	import EffectList from "../effects/EffectList.svelte";
	import Text from "$lib/components/localisation/Text.svelte";
	import StatIcon from "../stats/StatIcon.svelte";
	import Parameters from "./Parameters.svelte";

    export let capability: Capability;
</script>

<style lang="scss">
    @use "@reguitzell/styles" as rz;

    .capability-chip {
        @include rz.column(xs);
        align-items: stretch;
    }

    .capability-activation {
        @include rz.row;

        :global(.capability-icon) {
            margin-right: #{rz.size(xs)};
            color: var(--text-subtle-color);
        }
    }

    .moment {
        @include rz.row;
        margin-right: #{rz.size(xs)};
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
</style>

<div {...standardAttributes($$props, "capability-chip")}>

    <div class="capability-activation">

        <!-- Capability type / triggers -->
        <div class="moment">
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
        </div>

        <!-- Cost -->
        {#if !capability.cost.isFree()}
            <Parameters>
                {#each attributeTypes as attribute}
                    {#if capability.cost.get(attribute) !== 0}
                        <span class="stat-cost">
                            <StatIcon stat={attribute}/>
                            <span class="stat-value">{capability.cost.get(attribute)}</span>
                        </span>
                    {/if}
                {/each}
                {#if capability.cost.charges}
                    <span class="charges-cost">
                        <InlineSvg src="capabilities/charge.svg" class="charges-icon"/>
                        <span class="charge-value">{capability.cost.charges}</span>
                    </span>
                {/if}
                {#if capability.cost.exhaust}
                    <InlineSvg src="capabilities/exhaust.svg" class="exhaust-icon"/>
                {/if}
            </Parameters>
        {/if}
    </div>

    <!-- Effects -->
    <EffectList style="flex: 1 1 auto; margin-left: 1.2em;" effects={capability.effects} />
</div>