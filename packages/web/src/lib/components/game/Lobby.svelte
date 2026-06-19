<!--
	@component Game lobby shown during the PREPARATION phase.

	The owner can start the game; other participants can leave;
	spectators can pick a character and join.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		lobby: {
			...css.column('md'),
			maxWidth: '40em'
		},
		section: {
			...css.column('sm')
		},
		sectionTitle: {
			fontWeight: 'bold',
			color: css.text.headingColor
		},
		participantList: {
			...css.column('xs')
		},
		participant: {
			paddingLeft: css.spacing.sm,
			borderLeft: `3px solid ${css.palette.buccaneer}`
		},
		ownerBadge: {
			fontSize: '0.85em',
			color: css.palette.buccaneer
		},
		actions: {
			...css.row('md'),
			alignItems: 'center'
		}
	});
</script>

<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Dropdown from '$lib/components/forms/Dropdown.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getGameStore } from '$lib/context/gamestore';
	import { entities, isCampaign } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		/** The currently authenticated user, or null/undefined. */
		user: { id: string; username: string } | null | undefined;
		/** Characters owned by the current user, available for joining. */
		characters: Array<{ id: number; name: string }>;
	}

	const { user, characters, ...attributes }: Props = $props();

	const store = getGameStore();

	const campaignTitle = $derived.by(() => {
		if (!store.gameMeta?.campaignId) return undefined;
		const entity = entities.get(store.gameMeta.campaignId);
		return entity && isCampaign(entity) ? entity.title : undefined;
	});

	const isOwner = $derived(user != null && store.gameMeta?.ownerId === user.id);
	const isParticipant = $derived(
		user != null && (store.gameMeta?.participants.some((p) => p.userId === user.id) ?? false)
	);

	let selectedCharacterId = $state('');

	const characterOptions = $derived.by(() => {
		const usedCharacterIds = new Set(store.gameMeta?.participants.map((p) => p.characterId) ?? []);
		return characters
			.filter((c) => !usedCharacterIds.has(c.id))
			.map((c) => ({
				value: String(c.id),
				label: { ca: c.name, es: c.name, en: c.name }
			}));
	});

	function handleJoin(): void {
		if (!selectedCharacterId) return;
		store.joinGame(Number(selectedCharacterId));
	}
</script>

<div {...standardAttributes(attributes, styles.lobby)}>
	<div class={styles.section}>
		<h2 class={styles.sectionTitle}>
			<Text ca="Campanya" es="Campaña" en="Campaign" />
		</h2>
		{#if campaignTitle}
			<p>{campaignTitle.ca}</p>
		{:else}
			<p><Text ca="Desconeguda" es="Desconocida" en="Unknown" /></p>
		{/if}
	</div>

	<div class={styles.section}>
		<h2 class={styles.sectionTitle}>
			<Text ca="Jugadors" es="Jugadores" en="Players" />
		</h2>
		<ul class={styles.participantList}>
			{#each store.gameMeta?.participants ?? [] as p (p.userId)}
				<li class={styles.participant}>
					{p.characterName}
					{#if p.userId === store.gameMeta?.ownerId}
						<span class={styles.ownerBadge}>
							<Text ca=" (creador)" es=" (creador)" en=" (owner)" />
						</span>
					{/if}
				</li>
			{/each}
		</ul>
	</div>

	<div class={styles.actions}>
		{#if isOwner}
			<Button onclick={() => store.startGame()}>
				<Text ca="Començar partida" es="Empezar partida" en="Start game" />
			</Button>
		{:else if isParticipant}
			<Button onclick={() => store.leaveGame()}>
				<Text ca="Abandonar partida" es="Abandonar partida" en="Leave game" />
			</Button>
		{:else}
			<Dropdown
				options={characterOptions}
				value={selectedCharacterId}
				onChange={(v) => (selectedCharacterId = v)}
			/>
			<Button disabled={!selectedCharacterId} onclick={handleJoin}>
				<Text ca="Unir-se" es="Unirse" en="Join game" />
			</Button>
		{/if}
	</div>
</div>
