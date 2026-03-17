<script lang="ts" module>
	import type { LocalisedText } from '@songsofdoom/common';
	import type { TargetType } from '@songsofdoom/game';

	const getGender = (target: Target | TargetDiscriminator | undefined, locale: string) => {
		if (!target || locale === 'en') return undefined;
		if (target.type?.has('location')) return 'feminine';
		return 'masculine';
	};

	type TextForm = 'plain' | 'determinate' | 'indeterminate' | 'plural';

	const targetsText: Record<
		TargetType,
		{
			plain: LocalisedText;
			determinate: LocalisedText;
			indeterminate?: LocalisedText;
			plural?: LocalisedText;
		}
	> = {
		player: {
			plain: {
				ca: 'jugador',
				es: 'jugador',
				en: 'player'
			},
			determinate: {
				ca: 'el jugador',
				es: 'el jugador',
				en: 'the player'
			},
			indeterminate: {
				ca: 'un jugador',
				es: 'un jugador',
				en: 'a player'
			},
			plural: {
				ca: 'jugadors',
				es: 'jugadores',
				en: 'players'
			}
		},
		owner: {
			plain: {
				ca: 'propietari',
				es: 'propietario',
				en: 'owner'
			},
			determinate: {
				ca: 'el propietari',
				es: 'el propietario',
				en: 'the owner'
			}
		},
		'active-player': {
			plain: {
				ca: 'jugador actiu',
				es: 'jugador activo',
				en: 'active player'
			},
			determinate: {
				ca: 'el jugador actiu',
				es: 'el jugador activo',
				en: 'the active player'
			}
		},
		attacker: {
			plain: {
				ca: 'atacant',
				es: 'atacante',
				en: 'attacker'
			},
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
			plain: {
				ca: 'defensor',
				es: 'defensor',
				en: 'defender'
			},
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
			plain: {
				ca: 'enemic',
				es: 'enemigo',
				en: 'enemy'
			},
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
			plain: {
				ca: 'aliat',
				es: 'aliado',
				en: 'ally'
			},
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
			plain: {
				ca: 'objecte',
				es: 'objeto',
				en: 'object'
			},
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
			plain: {
				ca: 'ubicació',
				es: 'ubicación',
				en: 'location'
			},
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

	const getText = (
		target: Target | TargetDiscriminator | undefined,
		form: TextForm
	): string | undefined => {
		if (!target?.type) return undefined;
		const fragments: string[] = [];
		for (const type of target.type) {
			let typeText: LocalisedText | undefined;
			if (form === 'determinate') {
				typeText = targetsText[type].determinate;
			} else if (form === 'plural') {
				typeText = targetsText[type].plural;
			} else if (form === 'indeterminate') {
				typeText = targetsText[type].indeterminate;
			} else {
				typeText = targetsText[type].plain;
			}
			if (typeText) {
				fragments.push(translate(typeText, getLocale()));
			}
		}
		return fragments.join(', ');
	};

	const wrapText = (text: string, relation: Props['relation']): string => {
		if (relation === 'possessive') {
			return possessiveRelation(text, getLocale());
		} else if (relation === 'to') {
			return toRelation(text, getLocale());
		} else {
			return text;
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
	import Variable from '../structured-text/Variable.svelte';

	interface Props extends StandardAttributeProps {
		target?: Target | TargetDiscriminator;
		relation?: 'possessive' | 'to';
		cardinality?: TargetCardinality;
	}

	const { target, relation, cardinality: customCardinality, ...attributes }: Props = $props();
	const cardinality = $derived(
		customCardinality ?? (target instanceof Target ? target.cardinality : undefined) ?? undefined
	);
	const textForm: TextForm = $derived.by(() => {
		if (!target) return 'indeterminate';
		if (cardinality?.isEveryTarget()) return 'plain';
		if (cardinality?.isMultipleTargets()) return 'plural';
		if (
			target instanceof Target &&
			target.selection !== 'random' &&
			target.selection !== 'player-chosen'
		) {
			return 'determinate';
		}
		return 'indeterminate';
	});
	const gender = $derived(getGender(target, getLocale()));
	const text = $derived(getText(target, textForm));
</script>

{#if target}
	<span {...standardAttributes(attributes, 'target-chip')}>
		{#if cardinality && !cardinality.isSingleTarget()}
			{#if relation === 'possessive'}
				<Text ca="de" es="de" en="of" />
			{:else if relation === 'to'}
				<Text ca="a" es="a" en="to" />
			{/if}
			{#if cardinality.isEveryTarget()}
				<Text ca="cada" es="cada" en="every" />
			{:else}
				<ExpressionChip expression={cardinality.min} />
				{#if cardinality.max === Infinity}
					<Text ca="o més" es="o más" en="or more" />
				{:else if cardinality.min !== cardinality.max}
					<Text ca="a" es="a" en="to" />
					<ExpressionChip expression={cardinality.max} />
				{/if}
			{/if}
			{text}
		{:else}
			{wrapText(text ?? '', relation)}
		{/if}
		{#if target instanceof Target && target.variable}
			{#if !text && relation}
				{#if relation === 'possessive'}
					<Text ca="de" es="de" en="of" />
				{:else if relation === 'to'}
					<Text ca="a" es="a" en="to" />
				{/if}
			{/if}
			<Variable class="variable">{target.variable}</Variable>
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
