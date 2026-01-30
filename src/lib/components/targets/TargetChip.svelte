<script lang="ts">
	import type { Target } from '$lib/catalog/models/target';
	import { getLocale } from '$lib/context/locale';
	import { possessiveRelation, translate, type LocalisedText } from '$lib/localisation';
	import ExpressionChip from '../ExpressionChip.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		target: Target;
		ellideSelf?: boolean;
		relation?: 'possessive';
	}

	const { target, ellideSelf = false, relation, ...attributes }: Props = $props();
	const locale = getLocale();
</script>

{#snippet text(localisedText: LocalisedText)}
	{#if relation === 'possessive'}
		{possessiveRelation(translate(localisedText, locale), locale)}
	{:else}
		{translate(localisedText, locale)}
	{/if}
{/snippet}

{#if !ellideSelf || target.type !== 'self' || target.condition}
	<span {...standardAttributes(attributes, 'target-chip')}>
		{#if target.type === 'self'}
			{@render text({ ca: 'tu mateix', es: 'ti mismo', en: 'yourself' })}
		{:else if target.type === 'attacker'}
			{@render text({ ca: "l'atacant", es: 'el atacante', en: 'the attacker' })}
		{:else if target.type === 'defender'}
			{@render text({ ca: 'el defensor', es: 'el defensor', en: 'the defender' })}
		{:else if target.type === 'enemy'}
			{@render text({ ca: 'un enemic', es: 'un enemigo', en: 'an enemy' })}
		{:else if target.type === 'allEnemies'}
			{@render text({ ca: 'tots els enemics', es: 'todos los enemigos', en: 'all enemies' })}
		{:else if target.type === 'ally'}
			{@render text({ ca: 'un aliat', es: 'un aliado', en: 'an ally' })}
		{:else if target.type === 'allAllies'}
			{@render text({ ca: 'tots els aliats', es: 'todos los aliados', en: 'all allies' })}
		{:else if target.type === 'object'}
			{@render text({ ca: 'un objecte', es: 'un objeto', en: 'an object' })}
		{:else if target.type === 'allObjects'}
			{@render text({ ca: 'tots els objectes', es: 'todos los objetos', en: 'all objects' })}
		{:else if target.type === 'ownedObject'}
			{@render text({ ca: 'un objecte propi', es: 'un objeto propio', en: 'an owned object' })}
		{:else if target.type === 'allOwnedObjects'}
			{@render text({
				ca: 'tots els objectes propis',
				es: 'todos los objetos propios',
				en: 'all owned objects'
			})}
		{/if}
		<ExpressionChip expression={target.condition} />
	</span>
{/if}
