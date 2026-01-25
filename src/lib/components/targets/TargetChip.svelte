<script lang="ts">
	import type { Target } from '$lib/catalog/models/target';
	import { getLocale } from '$lib/context/locale';
	import { caPossessive } from '$lib/localisation';
	import ConditionList from '../conditions/ConditionList.svelte';
	import Text from '../localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		target: Target;
		ellideSelf?: boolean;
		relation?: 'possessive';
	}

	const { target, ellideSelf = false, relation, ...attributes }: Props = $props();
	const rel = $derived(
		relation === 'possessive'
			? (t: string) => (getLocale() === 'ca' ? caPossessive(t) : t)
			: (t: string) => t
	);
</script>

{#if !ellideSelf || target.type !== 'self' || target.conditions.length}
	<span {...standardAttributes(attributes, 'target-chip')}>
		{#if target.type === 'self'}
			<Text ca={rel('a tu mateix')} es={rel('a ti mismo')} en={rel('yourself')} />
		{:else if target.type === 'enemy'}
			<Text ca={rel('un enemic')} es={rel('un enemigo')} en={rel('an enemy')} />
		{:else if target.type === 'allEnemies'}
			<Text ca={rel('tots els enemics')} es={rel('todos los enemigos')} en={rel('all enemies')} />
		{:else if target.type === 'ally'}
			<Text ca={rel('un aliat')} es={rel('un aliado')} en={rel('an ally')} />
		{:else if target.type === 'allAllies'}
			<Text ca={rel('tots els aliats')} es={rel('todos los aliados')} en={rel('all allies')} />
		{:else if target.type === 'object'}
			<Text ca={rel('un objecte')} es={rel('un objeto')} en={rel('an object')} />
		{:else if target.type === 'allObjects'}
			<Text ca={rel('tots els objectes')} es={rel('todos los objetos')} en={rel('all objects')} />
		{:else if target.type === 'ownedObject'}
			<Text ca={rel('un objecte propi')} es={rel('un objeto propio')} en={rel('an owned object')} />
		{:else if target.type === 'allOwnedObjects'}
			<Text
				ca={rel('tots els objectes propis')}
				es={rel('todos los objetos propios')}
				en={rel('all owned objects')}
			/>
		{/if}
		<ConditionList conditions={target.conditions} />
	</span>
{/if}
