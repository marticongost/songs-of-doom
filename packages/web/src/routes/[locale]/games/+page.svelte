<!--
	@component
	Games list page — shows the user's active games, open games to join,
	and a button to create a new game.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		section: {
			marginBottom: css.spacing.xl
		},
		sectionTitle: {
			fontFamily: css.fonts.heading,
			fontSize: '1.5rem',
			color: css.text.headingColor,
			marginBottom: css.spacing.sm
		},
		buttons: {
			marginTop: css.spacing.lg
		},
		resultsCount: {
			color: css.text.subtleColor,
			marginBottom: css.spacing.md
		},
		emptyMessage: {
			color: css.text.subtleColor,
			fontStyle: 'italic'
		},
		loginPrompt: {
			color: css.text.mutedColor,
			fontStyle: 'italic'
		}
	});
</script>

<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		DateColumn,
		IntegerColumn,
		LocalisedTextColumn,
		StringColumn,
		Table
	} from '$lib/components/tables';
	import { gameUrl, newGameUrl } from '$lib/urls';
	import type { PageProps } from './$types';
	import type { ResolvedGame } from './+page.server';

	let { data }: PageProps = $props();

	const locale = data.locale;
	const myGames = $derived(data.myGames);
	const openGames = $derived(data.openGames);
	const user = $derived(data.user ?? null);

	function openGame(game: ResolvedGame): void {
		gameUrl.go(game.id, locale);
	}

	const gameColumns = $derived([
		new LocalisedTextColumn<ResolvedGame>({
			header: { ca: 'Campanya', es: 'Campaña', en: 'Campaign' },
			expression: (g) => g.campaignTitle ?? undefined
		}),
		new StringColumn<ResolvedGame>({
			header: { ca: 'Propietari', es: 'Propietario', en: 'Owner' },
			expression: (g) => g.ownerName ?? '—'
		}),
		new IntegerColumn<ResolvedGame>({
			header: { ca: 'Jugadors', es: 'Jugadores', en: 'Players' },
			expression: 'participantCount'
		}),
		new DateColumn<ResolvedGame>({
			header: { ca: 'Creada', es: 'Creada', en: 'Created' },
			expression: 'createdAt',
			dateStyle: 'short'
		})
	]);
</script>

<!-- My Games -->
<section class={styles.section}>
	<h2 class={styles.sectionTitle}>
		<Text ca="Les meves partides" es="Mis partidas" en="My games" />
	</h2>
	{#if !user}
		<p class={styles.loginPrompt}>
			<Text
				ca="Inicia sessió per veure les teves partides."
				es="Inicia sesión para ver tus partidas."
				en="Log in to see your games."
			/>
		</p>
	{:else if myGames.length === 0}
		<p class={styles.emptyMessage}>
			<Text
				ca="Encara no tens cap partida."
				es="Todavía no tienes ninguna partida."
				en="You don't have any games yet."
			/>
		</p>
	{:else}
		<p class={styles.resultsCount}>
			<Text
				ca="%(count) partides"
				es="%(count) partidas"
				en="%(count) games"
				count={myGames.length}
			/>
		</p>
		<Table rows={myGames} columns={gameColumns} onClickRow={openGame} />
	{/if}
</section>

<!-- Open Games -->
<section class={styles.section}>
	<h2 class={styles.sectionTitle}>
		<Text ca="Partides obertes" es="Partidas abiertas" en="Open games" />
	</h2>
	{#if openGames.length === 0}
		<p class={styles.emptyMessage}>
			<Text
				ca="No hi ha partides obertes a les que unir-se."
				es="No hay partidas abiertas a las que unirse."
				en="There are no open games to join."
			/>
		</p>
	{:else}
		<p class={styles.resultsCount}>
			<Text
				ca="%(count) partides"
				es="%(count) partidas"
				en="%(count) games"
				count={openGames.length}
			/>
		</p>
		<Table rows={openGames} columns={gameColumns} onClickRow={openGame} />
	{/if}

	<div class={styles.buttons}>
		<Button href={newGameUrl.get(locale)}>
			<Text ca="Crear nova partida" es="Crear nueva partida" en="Create new game" />
		</Button>
	</div>
</section>
