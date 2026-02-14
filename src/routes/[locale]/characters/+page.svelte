<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { DateColumn, IntegerColumn, StringColumn, Table } from '$lib/components/tables';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	interface CharacterRow {
		id: number;
		name: string;
		owner: string;
		totalXp: number | null;
		lastModified: Date | null;
	}

	const rows: CharacterRow[] = $derived(
		data.characters.map((character: (typeof data.characters)[number]) => {
			const latestRevision = character.revisions[0];
			return {
				id: character.id,
				name: character.name,
				owner: character.owner.username,
				totalXp: latestRevision?.totalXp ?? null,
				lastModified: latestRevision?.createdAt ?? null
			};
		})
	);

	const columns = [
		new StringColumn<CharacterRow>({
			header: { ca: 'Nom', es: 'Nombre', en: 'Name' },
			expression: 'name'
		}),
		new IntegerColumn<CharacterRow>({
			header: { ca: 'XP total', es: 'XP total', en: 'Total XP' },
			expression: (row) => row.totalXp ?? 0
		}),
		new DateColumn<CharacterRow>({
			header: { ca: 'Última modificació', es: 'Última modificación', en: 'Last modified' },
			expression: (row) => row.lastModified ?? new Date(0)
		}),
		new StringColumn<CharacterRow>({
			header: { ca: 'Propietari', es: 'Propietario', en: 'Owner' },
			expression: (row) => row.owner
		})
	];
</script>

<p class="results-count">
	<Text
		ca="%(count) personatges"
		es="%(count) personajes"
		en="%(count) characters"
		count={rows.length}
	/>
</p>

{#if rows.length > 0}
	<Table {rows} {columns} />
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

	.results-count {
		color: var(--text-subtle-color);
		margin-bottom: rz.size(md);
	}

	.empty-message {
		color: var(--text-subtle-color);
		font-style: italic;
	}
</style>
