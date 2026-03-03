<script lang="ts" module>
	import type { LocalisedText } from '@songsofdoom/common';
	import type { TargetType } from '@songsofdoom/game';

	const getGender = (target: Target | TargetDiscriminator | undefined, locale: string) => {
		if (!target || locale === 'en') return undefined;
		if (target.type?.has('location')) return 'feminine';
		return 'masculine';
	};

	const targetsText: Record<
		TargetType,
		{ determinate: LocalisedText; indeterminate?: LocalisedText; plural?: LocalisedText }
	> = {
		owner: {
			determinate: {
				ca: 'el propietari',
				es: 'el propietario',
				en: 'the owner'
			}
		},
		'active-player': {
			determinate: {
				ca: 'el jugador actiu',
				es: 'el jugador activo',
				en: 'the active player'
			}
		},
		attacker: {
			determinate: {
				ca: "l'atacant",
				es: 'el atacante',
				en: 'the attacker'
			},
			indeterminate: {
				ca: 'un atacant',
				es: 'un atacante',
				en: 'an attacker'
			},
			plural: {
				ca: 'atacants',
				es: 'atacantes',
				en: 'attackers'
			}
		},
		defender: {
			determinate: {
				ca: 'el defensor',
				es: 'el defensor',
				en: 'the defender'
			},
			indeterminate: {
				ca: 'un defensor',
				es: 'un defensor',
				en: 'a defender'
			},
			plural: {
				ca: 'defensors',
				es: 'defensores',
				en: 'defenders'
			}
		},
		enemy: {
			determinate: {
				ca: "l'enemic",
				es: 'el enemigo',
				en: 'the enemy'
			},
			indeterminate: {
				ca: 'un enemic',
				es: 'un enemigo',
				en: 'an enemy'
			},
			plural: {
				ca: 'enemics',
				es: 'enemigos',
				en: 'enemies'
			}
		},
		ally: {
			determinate: {
				ca: "l'aliat",
				es: 'el aliado',
				en: 'the ally'
			},
			indeterminate: {
				ca: 'un aliat',
				es: 'un aliado',
				en: 'an ally'
			},
			plural: {
				ca: 'aliats',
				es: 'aliados',
				en: 'allies'
			}
		},
		object: {
			determinate: {
				ca: "l'objecte",
				es: 'el objeto',
				en: 'the object'
			},
			indeterminate: {
				ca: 'un objecte',
				es: 'un objeto',
				en: 'an object'
			},
			plural: {
				ca: 'objectes',
				es: 'objetos',
				en: 'objects'
			}
		},
		location: {
			determinate: {
				ca: "l'ubicació",
				es: 'la ubicación',
				en: 'the location'
			},
			indeterminate: {
				ca: 'una ubicació',
				es: 'una ubicación',
				en: 'a location'
			},
			plural: {
				ca: 'ubicacions',
				es: 'ubicaciones',
				en: 'locations'
			}
		}
	};

	interface GetTextOptions {
		target?: Target | TargetDiscriminator;
		relation: Props['relation'];
		isDeterminate: boolean;
		isPlural: boolean;
	}

	const getText = ({
		target,
		relation,
		isDeterminate,
		isPlural
	}: GetTextOptions): string | undefined => {
		if (!target?.type) return undefined;
		const fragments: string[] = [];
		for (const type of target.type) {
			let typeText: LocalisedText | undefined;
			if (isDeterminate) {
				typeText = targetsText[type].determinate;
			} else if (isPlural) {
				typeText = targetsText[type].plural;
			} else {
				typeText = targetsText[type].indeterminate;
			}
			if (typeText) {
				fragments.push(translate(typeText, getLocale()));
			}
		}
		return wrapText(fragments.join(', '), relation);
	};

	const wrapText = (text: string | LocalisedText, relation: Props['relation']): string => {
		const localisedTarget = typeof text === 'string' ? text : translate(text, getLocale());
		if (relation === 'possessive') {
			return possessiveRelation(localisedTarget, getLocale());
		} else if (relation === 'to') {
			return toRelation(localisedTarget, getLocale());
		} else {
			return localisedTarget;
		}
	};
</script>

<script lang="ts">
	import { getLocale } from '$lib/context/locale';
	import { possessiveRelation, toRelation, translate } from '@songsofdoom/common/localisation';
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

	const isPlural = $derived(
		!!target && (cardinality ?? ('cardinality' in target && target.cardinality)) === 'multiple'
	);
	const isDeterminate = $derived(
		target instanceof Target &&
			target.selection !== 'random' &&
			target.selection !== 'player-chosen'
	);
	const gender = $derived(getGender(target, getLocale()));
	const text = $derived(getText({ target, relation, isDeterminate, isPlural }));
</script>

{#if target}
	<span {...standardAttributes(attributes, 'target-chip')}>
		{#if text}
			{text}
		{/if}
		{#if target instanceof Target && target.variable}
			{#if !text && relation}
				{#if relation === 'possessive'}
					<Text ca="de" es="de" en="of" />
				{:else if relation === 'to'}
					<Text ca="a" es="a" en="to" />
				{/if}
			{/if}
			<span class="variable">
				{target.variable}
			</span>
		{/if}
		<ExpressionChip expression={target.condition} />
		{#if target instanceof Target}
			{#if target.selection === 'player-chosen'}{:else if target.selection === 'random'}
				<Text
					ca={gender === 'feminine' ? 'aleatòria' : 'aleatori'}
					es={gender === 'feminine' ? 'aleatoria' : 'aleatorio'}
					en="random"
				/>
			{:else if target.selection === 'this'}
				<Text ca="d'aquesta carta" es="de esta carta" en="of this card" />
			{:else if target.selection === 'closest'}
				{#if target.type?.has('location')}
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

<style lang="scss">
	.variable {
		font-weight: bold;
		font-family: var(--variable-font);
		color: var(--variable-color);
	}
</style>
