<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		toolbar: {
			marginBottom: css.spacing.lg
		},
		resultsCount: {
			color: css.text.subtleColor,
			marginBottom: css.spacing.md
		},
		emptyMessage: {
			color: css.text.subtleColor,
			fontStyle: 'italic'
		}
	});
</script>

<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { DateColumn, IntegerColumn, StringColumn, Table } from '$lib/components/tables';
	import type { Character } from '$lib/models/characters';
	import { characterUrl, newCharacterUrl } from '$lib/urls';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = data.locale;
	const characters = $derived(data.characters);

	function openCharacter(character: Character): void {
		characterUrl.go(character, locale);
	}
</script>

<div class={styles.toolbar}>
	<Button href={newCharacterUrl.get(locale)}>
		<Text ca="Nou personatge" es="Nuevo personaje" en="New character" />
	</Button>
</div>

<p class={styles.resultsCount}>
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
	<p class={styles.emptyMessage}>
		<Text
			ca="Encara no hi ha cap personatge."
			es="Todavía no hay ningún personaje."
			en="There are no characters yet."
		/>
	</p>
{/if}
