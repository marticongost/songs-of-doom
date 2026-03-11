<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		label: {
			fontWeight: 'bold',
			fontFamily: css.fonts.heading,
			fontSize: '1.5em',
			...css.viewport.xs.hide()
		},
		list: css.row(),
		link: {
			...css.column('sm'),
			...css.focus.mixin,
			padding: css.spacing.md,
			color: css.palette.hurricane,
			borderBottomLeftRadius: css.spacing.sm,
			borderBottomRightRadius: css.spacing.sm,
			...css.viewport.xs.then({
				padding: css.spacing.sm
			}),
			svg: {
				filter: 'drop-shadow(0 0 0.5em black)',
				height: '3em',
				transition: 'transform 0.2s',
				...css.viewport.xs.then({
					height: '1.5em'
				})
			},
			'&:hover': { color: css.palette.ivory },
			'&:hover svg': { transform: 'scale(1.1)' },
			"&[data-match='selected'], &[data-match='ancestor']:not([data-path='/'])": {
				color: css.palette.silk
			}
		}
	});
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
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
	<ul class={styles.list} data-level={parent.depth}>
		{#if includeRoot && parent === root}
			{@render sectionEntry(root, level + 1, false)}
		{/if}
		{#each parent.children as section (section.path)}
			{@render sectionEntry(section, level + 1, true)}
		{/each}
	</ul>
{/snippet}

{#snippet sectionEntry(section: Section, level: number, recursive: boolean)}
	{@const match = getMatch(section)}
	<li data-match={match} data-level={level} data-path={section.path}>
		<a
			class={styles.link}
			href={resolve(('/[locale]' + section.path) as '/[locale]', { locale })}
			data-match={match}
			data-level={level}
			data-path={section.path}
		>
			<InlineSvg src="navigation/{section.getQualifiedName('--') || 'home'}.svg" />
			<span class={styles.label}>
				<Text {...section.title} />
			</span>
		</a>
		{#if recursive && section.children.length > 0 && (maxAllowedDepth === undefined || section.depth < maxAllowedDepth)}
			{@render sectionChildren(section, level)}
		{/if}
	</li>
{/snippet}

{#if root.children.length > 0 && (maxDepth === undefined || maxDepth > 0)}
	<nav {...standardAttributes(attributes)}>
		{@render sectionChildren(root, 0)}
	</nav>
{/if}
