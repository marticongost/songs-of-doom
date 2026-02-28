<script lang="ts" module>
	const getGender = (target: Target | TargetDiscriminator | undefined, locale: string) => {
		if (!target || locale === 'en') return undefined;
		if (target.type === 'location') return 'feminine';
		return 'masculine';
	};
</script>

<script lang="ts">
	import { getLocale } from '$lib/context/locale';
	import {
		possessiveRelation,
		toRelation,
		translate,
		type LocalisedText
	} from '@songsofdoom/common/localisation';
	import { Target, type TargetCardinality, type TargetDiscriminator } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		target?: Target | TargetDiscriminator;
		relation?: 'possessive' | 'to';
		cardinality?: TargetCardinality;
	}

	const { target, relation, cardinality, ...attributes }: Props = $props();
	const locale = getLocale();

	const isPlural = $derived(
		target && (cardinality ?? ('cardinality' in target && target.cardinality)) === 'multiple'
	);
	const isDeterminate = $derived(
		target instanceof Target &&
			target.selection !== 'random' &&
			target.selection !== 'player-chosen'
	);
	const gender = $derived(getGender(target, getLocale()));
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

{#if target}
	<span {...standardAttributes(attributes, 'target-chip')}>
		{#if target.type === 'owner'}
			{@render text({ ca: 'el propietari', es: 'el propietario', en: 'the owner' })}
		{:else if target.type === 'active-player'}
			{@render text({ ca: 'el jugador actiu', es: 'el jugador activo', en: 'the active player' })}
		{:else if target.type === 'attacker'}
			{@render text({ ca: "l'atacant", es: 'el atacante', en: 'the attacker' })}
		{:else if target.type === 'defender'}
			{@render text({ ca: 'el defensor', es: 'el defensor', en: 'the defender' })}
		{:else if target.type === 'enemy'}
			{#if isPlural}
				{@render text({ ca: 'enemics', es: 'enemigos', en: 'enemies' })}
			{:else if isDeterminate}
				{@render text({ ca: "l'enemic", es: 'el enemigo', en: 'the enemy' })}
			{:else}
				{@render text({ ca: 'un enemic', es: 'un enemigo', en: 'an enemy' })}
			{/if}
		{:else if target.type === 'ally'}
			{#if isPlural}
				{@render text({ ca: 'aliats', es: 'aliados', en: 'allies' })}
			{:else if isDeterminate}
				{@render text({ ca: "l'aliat", es: 'el aliado', en: 'the ally' })}
			{:else}
				{@render text({ ca: 'un aliat', es: 'un aliado', en: 'an ally' })}
			{/if}
		{:else if target.type === 'object'}
			{#if isPlural}
				{@render text({ ca: 'objectes', es: 'objetos', en: 'objects' })}
			{:else if isDeterminate}
				{@render text({ ca: "l'objecte", es: 'el objeto', en: 'the object' })}
			{:else}
				{@render text({ ca: 'un objecte', es: 'un objeto', en: 'an object' })}
			{/if}
		{:else if target.type === 'location'}
			{#if isPlural}
				{@render text({ ca: 'ubicacions', es: 'ubicaciones', en: 'locations' })}
			{:else if isDeterminate}
				{@render text({ ca: "l'ubicació", es: 'la ubicación', en: 'the location' })}
			{:else}
				{@render text({ ca: 'una ubicació', es: 'una ubicación', en: 'a location' })}
			{/if}
		{/if}
		<ExpressionChip expression={target.condition} />
		{#if target instanceof Target}
			{#if target.selection === 'player-chosen'}
				<Text
					ca={gender === 'feminine' ? 'escollida pel jugador' : 'escollit pel jugador'}
					es={gender === 'feminine' ? 'elegida por el jugador' : 'elegido por el jugador'}
					en="chosen by the player"
				/>
			{:else if target.selection === 'random'}
				<Text
					ca={gender === 'feminine' ? 'aleatòria' : 'aleatori'}
					es={gender === 'feminine' ? 'aleatoria' : 'aleatorio'}
					en="random"
				/>
			{:else if target.selection === 'closest'}
				{#if target.type === 'location'}
					<Text ca="actual" es="actual" en="current" />
				{:else}
					<Text
						ca={gender === 'feminine' ? 'més propera' : 'més proper'}
						es={gender === 'feminine' ? 'más cercana' : 'más cercano'}
						en="closest"
					/>
				{/if}
			{:else if target.selection === 'furthest'}
				<Text
					ca={gender === 'feminine' ? 'més distant' : 'més distant'}
					es={gender === 'feminine' ? 'más lejana' : 'más lejano'}
					en="furthest"
				/>
			{:else if 'lowest' in target.selection}
				<Text ca="amb menys" es="con menos" en="with lowest" />
				<ExpressionChip expression={target.selection.lowest} />
			{:else if 'highest' in target.selection}
				<Text ca="amb més" es="con más" en="with highest" />
				<ExpressionChip expression={target.selection.highest} />
			{/if}
		{/if}
	</span>
{/if}
