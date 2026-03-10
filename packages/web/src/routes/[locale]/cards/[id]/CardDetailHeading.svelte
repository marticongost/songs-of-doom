<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		cardDetailHeading: {
			...css.row('md')
		},
		icon: {
			fontSize: '2.5em',
			color: css.text.subtleColor
		}
	});

	const getSetIcon = (entity: Entity) => {
		if (entity.set instanceof Archetype) {
			return `archetypes/${entity.set.id}.svg`;
		} else if (entity.set instanceof Discipline) {
			return `disciplines/${entity.set.id}.svg`;
		} else if (entity.set instanceof Module) {
			return `modules/${entity.set.id}.svg`;
		}
		return undefined;
	};
</script>

<script lang="ts">
	import { page } from '$app/state';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import CardLevel from '$lib/components/entities/CardLevel.svelte';
	import type { Entity } from '@songsofdoom/game';
	import { Archetype, Discipline, Module } from '@songsofdoom/game';
	const setIcon = $derived(getSetIcon(page.data.entity as Entity));
</script>

<div class={styles.cardDetailHeading}>
	{#if setIcon}
		<InlineSvg src={setIcon} class={styles.icon} />
	{/if}
	<h1>{page.data.title}</h1>
	<CardLevel entity={page.data.entity as Entity} />
</div>
