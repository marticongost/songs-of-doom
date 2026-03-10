<!--
	@component
	Displays a localized explanation message for an entity acquisition or removal impediment.

	This component renders different messages based on the impediment type, with rich content
	support for cases like {@link ArchetypeRequiredImpediment} (which includes a link to the required archetype).

	For {@link ArchetypeRequiredImpediment}, when `entity` and `entityManager` are provided, also shows
	a button to acquire the entity along with all missing required archetypes.

	For {@link DisciplineRequiredImpediment}, when `entityManager` is provided, shows one button per
	unlocking archetype to acquire that archetype (and its dep chain) to unlock the discipline.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		missingDiscipline: {
			marginBottom: css.spacing.md
		},
		missingDisciplineButtons: {
			...css.column('sm')
		},
		addAllElements: {
			...css.row('sm'),
			whiteSpace: 'nowrap',
			fontSize: '0.9em'
		}
	});
</script>

<script lang="ts">
	import type { EntityManager } from '$lib/components/entities/entitymanager';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { entityUrl } from '$lib/urls';
	import { plural2 } from '@songsofdoom/common';
	import {
		ArchetypeRequiredImpediment,
		DisciplineRequiredImpediment,
		InnateTraitImpediment,
		InsufficientExperienceImpediment,
		InsufficientGoldImpediment,
		LimitReachedImpediment,
		MinimumAmountReachedRemovalImpediment,
		PermanentTraitRemovalImpediment,
		StandardTraitRemovalImpediment,
		type Entity,
		type EntityAcquisitionImpediment,
		type EntityRemovalImpediment
	} from '@songsofdoom/game';
	import Button from '../Button.svelte';
	import ExperienceIndicator from '../indicators/ExperienceIndicator.svelte';
	import GoldIndicator from '../indicators/GoldIndicator.svelte';
	import Link from '../Link.svelte';
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

	/**
	 * For DisciplineRequiredImpediment, computes per-archetype acquisition info.
	 */
	const disciplineArchetypeInfos = $derived.by(() => {
		if (!(impediment instanceof DisciplineRequiredImpediment) || !entityManager) {
			return undefined;
		}

		return impediment.unlockingArchetypes.map((archetype) => {
			const missingDeps = entityManager.getMissingDependencies(archetype);
			const toAcquire = [...missingDeps, archetype];
			const totalXpCost = toAcquire.reduce((sum, e) => sum + (e.xpCost ?? 0), 0);
			const totalGoldCost = toAcquire.reduce((sum, e) => sum + (e.goldCost ?? 0), 0);
			const canAcquire = !entityManager.getAcquisitionImpediment(archetype, {
				acquireDependencies: true
			});
			return { archetype, toAcquire, totalXpCost, totalGoldCost, canAcquire };
		});
	});

	function handleAddArchetype(toAcquire: Array<Entity>) {
		if (!entityManager) return;
		for (const e of toAcquire) {
			entityManager.onEntityAdded(e);
		}
	}
</script>

<span {...standardAttributes(attributes, styles.impedimentMessage)}>
	{#if impediment instanceof InnateTraitImpediment}
		<Text
			ca="Aquest tret és innat i només es pot adquirir durant la creació del personatge."
			es="Este rasgo es innato y solo se puede adquirir durante la creación del personaje."
			en="This trait is innate and can only be acquired during character creation."
		/>
	{:else if impediment instanceof ArchetypeRequiredImpediment}
		<div>
			<Text
				ca="Requereix l'arquetip %(archetype)."
				es="Requiere el arquetipo %(archetype)."
				en="Requires the %(archetype) archetype."
			>
				{#snippet archetype()}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- entityUrl.get() uses resolve() -->
					<Link href={entityUrl.get(impediment.dependency)} target="_blank">
						<Text {...impediment.dependency.title} />
					</Link>
				{/snippet}
			</Text>
		</div>
		{#if dependencyChainInfo?.canAcquireAll}
			<Button onclick={handleAddAll}>
				<div class={styles.addAllElements}>
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
	{:else if impediment instanceof DisciplineRequiredImpediment}
		<div class={styles.missingDiscipline}>
			<Text
				ca="Requereix la disciplina %(discipline)."
				es="Requiere la disciplina %(discipline)."
				en="Requires the %(discipline) discipline."
			>
				{#snippet discipline()}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- entityUrl.get() uses resolve() -->
					<a href={entityUrl.get(impediment.dependency)} target="_blank">
						<Text {...impediment.dependency.title} />
					</a>
				{/snippet}
			</Text>
		</div>
		<div class={styles.missingDisciplineButtons}>
			{#if disciplineArchetypeInfos}
				{#each disciplineArchetypeInfos as archetypeInfo (archetypeInfo.archetype.variantId)}
					{#if archetypeInfo.canAcquire}
						<Button onclick={() => handleAddArchetype(archetypeInfo.toAcquire)}>
							<div class={styles.addAllElements}>
								<Text ca="Adquirir via" es="Adquirir mediante" en="Acquire via" />
								<Text {...archetypeInfo.archetype.title} />
								{#if archetypeInfo.totalXpCost > 0}
									<ExperienceIndicator amount={archetypeInfo.totalXpCost} />
								{/if}
								{#if archetypeInfo.totalGoldCost > 0}
									<GoldIndicator amount={archetypeInfo.totalGoldCost} />
								{/if}
							</div>
						</Button>
					{/if}
				{/each}
			{/if}
		</div>
	{:else if impediment instanceof LimitReachedImpediment}
		<Text
			ca="Ja tens el màxim de %(max) %(copies)."
			es="Ya tienes el máximo de %(max) %(copies)."
			en="You already have the maximum of %(max) %(copies)."
			max={impediment.maxCopies}
		>
			{#snippet copies()}
				<Text
					ca={plural2(impediment.maxCopies, 'còpia', 'còpies')}
					es={plural2(impediment.maxCopies, 'copia', 'copias')}
					en={plural2(impediment.maxCopies, 'copy', 'copies')}
				/>
			{/snippet}
		</Text>
	{:else if impediment instanceof InsufficientExperienceImpediment}
		<Text
			ca="Necessites %(xp) per adquirir aquesta carta."
			es="Necesitas %(xp) para adquirir esta carta."
			en="You need %(xp) to acquire this card."
		>
			{#snippet xp()}
				<ExperienceIndicator amount={impediment.requiredExperience} />
			{/snippet}
		</Text>
	{:else if impediment instanceof InsufficientGoldImpediment}
		<Text
			ca="Necessites %(gold) per adquirir aquesta carta."
			es="Necesitas %(gold) para adquirir esta carta."
			en="You need %(gold) to acquire this card."
		>
			{#snippet gold()}
				<GoldIndicator amount={impediment.requiredGold} />
			{/snippet}
		</Text>
	{:else if impediment instanceof StandardTraitRemovalImpediment}
		<Text
			ca="Aquest tret és estàndard i no es pot eliminar."
			es="Este rasgo es estándar y no se puede eliminar."
			en="This trait is standard and cannot be removed."
		/>
	{:else if impediment instanceof PermanentTraitRemovalImpediment}
		<Text
			ca="Aquest tret és permanent i no es pot eliminar."
			es="Este rasgo es permanente y no se puede eliminar."
			en="This trait is permanent and cannot be removed."
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
