<!--
	@component
	Displays a localized explanation message for an entity acquisition or removal impediment.

	This component renders different messages based on the impediment type, with rich content
	support for cases like {@link ArchetypeRequiredImpediment} (which includes a link to the required archetype).

	For {@link ArchetypeRequiredImpediment}, when `entity` and `entityManager` are provided, also shows
	a button to acquire the entity along with all missing required archetypes.
-->
<script lang="ts">
	import type { EntityManager } from '$lib/components/entities/entitymanager';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { entityUrl } from '$lib/urls';
	import {
		ArchetypeRequiredImpediment,
		InnateTraitImpediment,
		InnateTraitRemovalImpediment,
		InsufficientExperienceImpediment,
		InsufficientGoldImpediment,
		LimitReachedImpediment,
		MinimumAmountReachedRemovalImpediment,
		StandardTraitRemovalImpediment,
		type Entity,
		type EntityAcquisitionImpediment,
		type EntityRemovalImpediment
	} from '@songsofdoom/game';
	import Button from '../Button.svelte';
	import ExperienceIndicator from '../indicators/ExperienceIndicator.svelte';
	import GoldIndicator from '../indicators/GoldIndicator.svelte';
	import Text from '../localisation/Text.svelte';

	interface Props extends StandardAttributeProps {
		/** The impediment to display a message for */
		impediment: EntityAcquisitionImpediment | EntityRemovalImpediment;
		/** The entity being acquired (optional, enables "add all" for ArchetypeRequiredImpediment) */
		entity?: Entity;
		/** The entity manager (optional, enables "add all" for ArchetypeRequiredImpediment) */
		entityManager?: EntityManager;
	}

	const { impediment, entity, entityManager, ...attributes }: Props = $props();

	/**
	 * For ArchetypeRequiredImpediment, calculates the missing dependencies and total costs.
	 */
	const dependencyChainInfo = $derived.by(() => {
		if (!(impediment instanceof ArchetypeRequiredImpediment) || !entity || !entityManager) {
			return undefined;
		}

		const missingDependencies = entityManager.getMissingDependencies(entity);
		const entitiesToAcquire = [...missingDependencies, entity];
		const totalXpCost = entitiesToAcquire.reduce((sum, e) => sum + (e.xpCost ?? 0), 0);
		const totalGoldCost = entitiesToAcquire.reduce((sum, e) => sum + (e.goldCost ?? 0), 0);

		// Check if the combined acquisition is possible
		const combinedImpediment = entityManager.getAcquisitionImpediment(entity, {
			acquireDependencies: true
		});

		return {
			missingDependencies,
			entitiesToAcquire,
			totalXpCost,
			totalGoldCost,
			canAcquireAll: !combinedImpediment
		};
	});

	function handleAddAll() {
		if (!dependencyChainInfo || !entityManager) return;

		// Add each entity in order (ancestors first, then the target entity)
		for (const e of dependencyChainInfo.entitiesToAcquire) {
			entityManager.onEntityAdded(e);
		}
	}
</script>

<span {...standardAttributes(attributes, 'impediment-message')}>
	{#if impediment instanceof InnateTraitImpediment}
		<Text
			ca="Aquest tret és innat i només es pot adquirir durant la creació del personatge."
			es="Este rasgo es innato y solo se puede adquirir durante la creación del personaje."
			en="This trait is innate and can only be acquired during character creation."
		/>
	{:else if impediment instanceof ArchetypeRequiredImpediment}
		<div class="missing-archetypes">
			<Text
				ca="Requereix l'arquetip %(archetype)."
				es="Requiere el arquetipo %(archetype)."
				en="Requires the %(archetype) archetype."
			>
				{#snippet archetype()}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- entityUrl.get() uses resolve() -->
					<a href={entityUrl.get(impediment.archetype)} target="_blank">
						<Text {...impediment.archetype.title} />
					</a>
				{/snippet}
			</Text>
		</div>
		{#if dependencyChainInfo?.canAcquireAll}
			<Button onclick={handleAddAll}>
				<div class="add-all-elements">
					<Text ca="Afegir-ho tot" es="Añadir todo" en="Add all" />
					{#if dependencyChainInfo.totalXpCost > 0}
						<ExperienceIndicator amount={dependencyChainInfo.totalXpCost} />
					{/if}
					{#if dependencyChainInfo.totalGoldCost > 0}
						<GoldIndicator amount={dependencyChainInfo.totalGoldCost} />
					{/if}
				</div>
			</Button>
		{/if}
	{:else if impediment instanceof LimitReachedImpediment}
		<Text
			ca="Ja tens el màxim de %(maxCopies) còpies."
			es="Ya tienes el máximo de %(maxCopies) copias."
			en="You already have the maximum of %(maxCopies) copies."
			maxCopies={impediment.maxCopies}
		/>
	{:else if impediment instanceof InsufficientExperienceImpediment}
		<Text
			ca="Necessites %(required) PX per adquirir aquesta carta."
			es="Necesitas %(required) PX para adquirir esta carta."
			en="You need %(required) XP to acquire this card."
			required={impediment.requiredExperience}
		/>
	{:else if impediment instanceof InsufficientGoldImpediment}
		<Text
			ca="Necessites %(required) or per adquirir aquesta carta."
			es="Necesitas %(required) oro para adquirir esta carta."
			en="You need %(required) gold to acquire this card."
			required={impediment.requiredGold}
		/>
	{:else if impediment instanceof StandardTraitRemovalImpediment}
		<Text
			ca="Aquest tret és estàndard i no es pot eliminar."
			es="Este rasgo es estándar y no se puede eliminar."
			en="This trait is standard and cannot be removed."
		/>
	{:else if impediment instanceof InnateTraitRemovalImpediment}
		<Text
			ca="Aquest tret és innat i no es pot eliminar."
			es="Este rasgo es innato y no se puede eliminar."
			en="This trait is innate and cannot be removed."
		/>
	{:else if impediment instanceof MinimumAmountReachedRemovalImpediment}
		<Text
			ca="Ja tens el mínim de %(minimum) còpies."
			es="Ya tienes el mínimo de %(minimum) copias."
			en="You already have the minimum of %(minimum) copies."
			minimum={impediment.minCopies}
		/>
	{/if}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.impediment-message {
		a {
			color: var(--accent-color);
			text-decoration: underline;

			&:hover {
				color: var(--accent-hover-color);
			}
		}
	}

	.missing-archetypes {
		margin-bottom: rz.size(md);
	}

	.add-all-elements {
		@include rz.row(sm);
		white-space: nowrap;
		font-size: 0.9em;
	}
</style>
