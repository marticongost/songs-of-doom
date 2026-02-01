<script lang="ts">
	import { onMount, tick } from 'svelte';
	import RuleEntryComponent from '$lib/components/rules-reference/RuleEntry.svelte';
	import RuleSearch from '$lib/components/rules-reference/RuleSearch.svelte';
	import type { RuleEntry } from '$lib/rules-reference/types';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let filteredEntries = $state<Array<RuleEntry> | undefined>(undefined);
	const visibleEntries = $derived(filteredEntries ?? data.entries);
	let bodyTexts = $state<Record<string, string>>({});
	let container: HTMLElement;

	function handleFilter(filtered: Array<RuleEntry>) {
		filteredEntries = filtered;
	}

	onMount(async () => {
		await tick();

		// Extract body text from rendered DOM for full-text search
		const texts: Record<string, string> = {};
		const sections = container.querySelectorAll('.rule-entry');
		for (const section of sections) {
			const slug = section.id;
			const body = section.querySelector('.rule-body');
			if (slug && body) {
				texts[slug] = body.textContent ?? '';
			}
		}
		bodyTexts = texts;

		// Handle initial hash anchor scroll
		const hash = window.location.hash;
		if (hash) {
			const target = document.getElementById(hash.slice(1));
			if (target) {
				target.scrollIntoView({ behavior: 'smooth' });
			}
		}
	});
</script>

<RuleSearch entries={data.entries} {bodyTexts} onFilter={handleFilter} />

<div class="rules-container" bind:this={container}>
	{#each visibleEntries as entry (entry.slug)}
		<RuleEntryComponent {entry} />
	{/each}

	{#if visibleEntries.length === 0}
		<p class="no-results">
			{#if data.entries.length === 0}
				<!-- No entries at all -->
			{:else}
				<!-- Search returned no results -->
			{/if}
		</p>
	{/if}
</div>
