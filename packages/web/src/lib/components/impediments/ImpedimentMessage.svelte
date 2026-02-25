<!--
	@component
	Displays a localized explanation message for an entity acquisition or removal impediment.

	This component renders different messages based on the impediment type, with rich content
	support for cases like ArchetypeRequiredImpediment (which includes a link to the required archetype).
-->
<script lang="ts">
	import {
		ArchetypeRequiredImpediment,
		type EntityAcquisitionImpediment,
		type EntityRemovalImpediment,
		InsufficientExperienceImpediment,
		InnateTraitImpediment,
		InnateTraitRemovalImpediment,
		LimitReachedImpediment,
		MinimumAmountReachedRemovalImpediment,
		StandardTraitRemovalImpediment
	} from '@songsofdoom/game';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { entityUrl } from '$lib/urls';
	import Text from '../localisation/Text.svelte';

	interface Props extends StandardAttributeProps {
		/** The impediment to display a message for */
		impediment: EntityAcquisitionImpediment | EntityRemovalImpediment;
	}

	const { impediment, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'impediment-message')}>
	{#if impediment instanceof InnateTraitImpediment}
		<Text
			ca="Aquest tret és innat i només es pot adquirir durant la creació del personatge."
			es="Este rasgo es innato y solo se puede adquirir durante la creación del personaje."
			en="This trait is innate and can only be acquired during character creation."
		/>
	{:else if impediment instanceof ArchetypeRequiredImpediment}
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
</style>
