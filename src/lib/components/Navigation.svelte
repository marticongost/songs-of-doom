<script lang="ts">
	import { getLocale } from '$lib/context/locale';
	import type { PathMatch, Section } from '$lib/navigation';
	import InlineSvg from './InlineSvg.svelte';
	import Text from './localisation/Text.svelte';
	import { standardAttributes } from './standardattributes';

	interface Props {
		root: Section;
		maxDepth?: number;
		includeRoot?: boolean;
		currentPath?: string;
		[key: string]: unknown;
	}

	const {
		root,
		maxDepth = undefined,
		includeRoot = false,
		currentPath = undefined,
		...attributes
	}: Props = $props();

	const maxAllowedDepth = $derived(maxDepth === undefined ? undefined : root.depth + maxDepth);
	const locale = getLocale();
	const getMatch = (section: Section): PathMatch =>
		currentPath === undefined ? 'none' : section.match(currentPath);
</script>

{#snippet sectionChildren(parent: Section, level: number)}
	<ul data-level={parent.depth}>
		{#if includeRoot && parent === root}
			{@render sectionEntry(root, level + 1, false)}
		{/if}
		{#each parent.children as section}
			{@render sectionEntry(section, level + 1, true)}
		{/each}
	</ul>
{/snippet}

{#snippet sectionEntry(section: Section, level: number, recursive: boolean)}
	{@const match = getMatch(section)}
	<li data-match={match} data-level={level}>
		<a href="/{locale}{section.path}" data-match={match} data-level={level}>
			<InlineSvg src="navigation/{section.getQualifiedName('--') || 'home'}.svg" />
			<span class="label">
				<Text {...section.title} />
			</span>
		</a>
		{#if recursive && section.children.length > 0 && (maxAllowedDepth === undefined || section.depth < maxAllowedDepth)}
			{@render sectionChildren(section, level)}
		{/if}
	</li>
{/snippet}

{#if root.children.length > 0 && (maxDepth === undefined || maxDepth > 0)}
	<nav {...standardAttributes(attributes, 'navigation')}>
		{@render sectionChildren(root, 0)}
	</nav>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	ul[data-level='0'] {
		@include rz.row;
	}
	a[data-level='1'] {
		@include rz.column(sm);
		@include rz.padding(md);

		:global(svg) {
			height: 3em;
			color: var(--text-muted-color);
		}

		.label {
			font-weight: bold;
			font-family: var(--heading-font);
			font-size: 1.5em;
			color: var(--text-subtle-color);
		}

		&[data-match='selected'] {
			:global(svg) {
				color: var(--text-highlight);
			}

			.label {
				color: var(--text-heading-color);
			}
		}
	}
</style>
