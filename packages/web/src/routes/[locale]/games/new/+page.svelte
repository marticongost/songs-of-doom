<!--
	@component
	Form page for creating a new game. The user selects one of their characters
	and a campaign, then the form POSTs JSON to the /api/game endpoint.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		createGameForm: {
			width: '30em',
			...css.column('md')
		},
		formField: {
			...css.column('xs'),
			label: {
				fontWeight: 'bold',
				color: css.text.headingColor
			}
		},
		noCharacters: {
			...css.column('md'),
			color: css.text.subtleColor,
			fontStyle: 'italic'
		}
	});
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import ErrorMessage from '$lib/components/errors/ErrorMessage.svelte';
	import Dropdown from '$lib/components/forms/Dropdown.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { gameUrl, newCharacterUrl } from '$lib/urls';
	import { translate, type Locale } from '@songsofdoom/common/localisation';
	import { entities, isCampaign } from '@songsofdoom/game';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = page.params.locale as Locale;
	const apiUrl = resolve('/[locale]/api/game', { locale });

	const campaigns = $derived(data.campaignIds.map((id) => entities.require(id)).filter(isCampaign));

	let selectedCampaignId = $state(campaigns.length > 0 ? campaigns[0].variantId : '');
	let selectedCharacterId = $state(data.characters.length > 0 ? String(data.characters[0].id) : '');
	let errorMessage = $state('');
	let submitting = $state(false);

	const campaignOptions = $derived(
		campaigns.map((c) => ({
			value: c.variantId,
			label: c.title
		}))
	);

	const characterOptions = $derived(
		data.characters.map((c) => ({
			value: String(c.id),
			label: { ca: c.name, es: c.name, en: c.name }
		}))
	);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		errorMessage = '';
		submitting = true;

		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Game-Client-Version': GAME_VERSION
				},
				body: JSON.stringify({
					campaignId: selectedCampaignId,
					characterId: Number(selectedCharacterId)
				})
			});

			if (response.ok) {
				const { gameId } = await response.json();
				gameUrl.go(gameId, locale);
			} else {
				errorMessage = await response.text();
			}
		} catch {
			errorMessage = translate(
				{
					ca: 'Error de xarxa. Torna-ho a intentar.',
					es: 'Error de red. Inténtalo de nuevo.',
					en: 'Network error. Please try again.'
				},
				locale
			);
		} finally {
			submitting = false;
		}
	}
</script>

{#if data.characters.length === 0}
	<div class={styles.noCharacters}>
		<p>
			<Text
				ca="No tens cap personatge. Crea'n un primer."
				es="No tienes ningún personaje. Crea uno primero."
				en="You have no characters. Create one first."
			/>
		</p>
		<Button href={newCharacterUrl.get(locale)}>
			<Text ca="Crear personatge" es="Crear personaje" en="Create character" />
		</Button>
	</div>
{:else}
	<form class={styles.createGameForm} onsubmit={handleSubmit}>
		{#if errorMessage}
			<ErrorMessage>{errorMessage}</ErrorMessage>
		{/if}

		<div class={styles.formField}>
			<label for="campaign">
				<Text ca="Campanya" es="Campaña" en="Campaign" />
			</label>
			<Dropdown
				id="campaign"
				options={campaignOptions}
				value={selectedCampaignId}
				onChange={(v) => (selectedCampaignId = v)}
			/>
		</div>

		<div class={styles.formField}>
			<label for="character">
				<Text ca="Personatge" es="Personaje" en="Character" />
			</label>
			<Dropdown
				id="character"
				options={characterOptions}
				value={selectedCharacterId}
				onChange={(v) => (selectedCharacterId = v)}
			/>
		</div>

		<Button type="submit" disabled={submitting}>
			<Text ca="Crear partida" es="Crear partida" en="Create game" />
		</Button>
	</form>
{/if}
