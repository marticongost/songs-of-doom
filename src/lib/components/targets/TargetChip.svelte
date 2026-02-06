<script lang="ts">
	import type { Target, TargetCardinality, TargetDiscriminator } from '$lib/catalog/models/target';
	import ExpressionChip from '$lib/components/expressions/ExpressionChip.svelte';
	import { getLocale } from '$lib/context/locale';
	import { possessiveRelation, toRelation, translate, type LocalisedText } from '$lib/localisation';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		target: Target | TargetDiscriminator;
		ellideSelf?: boolean;
		relation?: 'possessive' | 'to';
		cardinality?: TargetCardinality;
	}

	const { target, ellideSelf = false, relation, cardinality, ...attributes }: Props = $props();
	const locale = getLocale();

	const isPlural = $derived(
		(cardinality ?? ('cardinality' in target && target.cardinality)) === 'multiple'
	);
</script>

{#snippet text(localisedText: LocalisedText)}
	{@const localisedTarget = translate(localisedText, locale)}
	{#if relation === 'possessive'}
		{possessiveRelation(localisedTarget, locale)}
	{:else if relation === 'to'}
		{toRelation(localisedTarget, locale)}
	{:else}
		{localisedTarget}
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
			{#if isPlural}
				{@render text({ ca: 'enemics', es: 'enemigos', en: 'enemies' })}
			{:else}
				{@render text({ ca: 'un enemic', es: 'un enemigo', en: 'an enemy' })}
			{/if}
		{:else if target.type === 'ally'}
			{#if isPlural}
				{@render text({ ca: 'aliats', es: 'aliados', en: 'allies' })}
			{:else}
				{@render text({ ca: 'un aliat', es: 'un aliado', en: 'an ally' })}
			{/if}
		{:else if target.type === 'object'}
			{#if isPlural}
				{@render text({ ca: 'objectes', es: 'objetos', en: 'objects' })}
			{:else}
				{@render text({ ca: 'un objecte', es: 'un objeto', en: 'an object' })}
			{/if}
		{/if}
		<ExpressionChip expression={target.condition} />
	</span>
{/if}
