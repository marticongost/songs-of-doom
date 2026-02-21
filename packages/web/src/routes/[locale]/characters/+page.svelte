<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { DateColumn, IntegerColumn, StringColumn, Table } from '$lib/components/tables';
	import type { Character } from '$lib/models/characters';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const characters = $derived(data.characters);
	const newCharacterPath = '/[locale]/characters/new' as const;
	const characterDetailPath = '/[locale]/characters/[id]' as const;

	function openCharacter(character: Character): void {
		goto(resolve(characterDetailPath, { locale: data.locale, id: String(character.id) }));
	}
</script>

<div class="toolbar">
	<Button href={resolve(newCharacterPath, { locale: data.locale })}>
		<Text ca="Nou personatge" es="Nuevo personaje" en="New character" />
	</Button>
</div>

<p class="results-count">
	<Text
		ca="%(count) personatges"
		es="%(count) personajes"
		en="%(count) characters"
		count={characters.length}
	/>
</p>

{#if characters.length > 0}
	{@const columns = [
		new StringColumn<Character>({
			header: { ca: 'Nom', es: 'Nombre', en: 'Name' },
			expression: 'name'
		}),
		new IntegerColumn<Character>({
			header: { ca: 'XP total', es: 'XP total', en: 'Total XP' },
			expression: 'totalXp'
		}),
		new DateColumn<Character>({
			header: { ca: 'Última modificació', es: 'Última modificación', en: 'Last modified' },
			expression: 'lastModified'
		}),
		new StringColumn<Character>({
			header: { ca: 'Propietari', es: 'Propietario', en: 'Owner' },
			expression: (character) => character.owner.username
		})
	]}
	<Table rows={characters} {columns} onClickRow={openCharacter} />
{:else}
	<p class="empty-message">
		<Text
			ca="Encara no hi ha cap personatge."
			es="Todavía no hay ningún personaje."
			en="There are no characters yet."
		/>
	</p>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.toolbar {
		margin-bottom: rz.size(lg);
	}

	.results-count {
		color: var(--text-subtle-color);
		margin-bottom: rz.size(md);
	}

	.empty-message {
		color: var(--text-subtle-color);
		font-style: italic;
	}
</style>
