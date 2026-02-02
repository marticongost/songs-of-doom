import type { Component } from 'svelte';
import { locales, translate, type Locale, type LocalisedText } from '$lib/localisation';
import type { RuleEntry, SvxModule } from './types';
import { modelSources } from './model-sources';

const entryModules = import.meta.glob<SvxModule>('./entries/**/*.{svx,svelte}', { eager: true });

/** Extract slug and locale from a glob key like './entries/weapon/ca.svx' */
function parseEntryPath(path: string): { slug: string; locale: Locale } | undefined {
	const match = path.match(/^\.\/entries\/([^/]+)\/(\w+)\.(svx|svelte)$/);
	if (!match) return undefined;
	const [, slug, localePart] = match;
	if (!locales.includes(localePart as Locale)) return undefined;
	return { slug, locale: localePart as Locale };
}

function buildIndex(): RuleEntry[] {
	// Group entry modules by slug
	const slugMap = new Map<
		string,
		{
			modules: Partial<Record<Locale, SvxModule>>;
		}
	>();

	for (const [path, module] of Object.entries(entryModules)) {
		const parsed = parseEntryPath(path);
		if (!parsed) continue;

		if (!slugMap.has(parsed.slug)) {
			slugMap.set(parsed.slug, { modules: {} });
		}
		slugMap.get(parsed.slug)!.modules[parsed.locale] = module;
	}

	const entries: RuleEntry[] = [];

	for (const [slug, data] of slugMap) {
		const modelTitle = modelSources[slug];

		// Resolve title: model source takes precedence, otherwise assemble from front matter
		let title: LocalisedText;
		if (modelTitle) {
			title = modelTitle;
		} else {
			title = {};
			for (const locale of locales) {
				const svxModule = data.modules[locale];
				if (svxModule?.metadata?.title) {
					title[locale] = svxModule.metadata.title;
				}
			}
		}

		// Build locale → Component map
		const bodies: Partial<Record<Locale, Component>> = {};
		for (const locale of locales) {
			const svxModule = data.modules[locale];
			if (svxModule) {
				bodies[locale] = svxModule.default;
			}
		}

		entries.push({ slug, title, bodies });
	}

	return entries;
}

export const rulesIndex: RuleEntry[] = buildIndex();

/** Retrieve a single rule entry by slug. */
export function getRuleEntry(slug: string): RuleEntry | undefined {
	return rulesIndex.find((e) => e.slug === slug);
}

/** Sort rule entries alphabetically by title in the given locale. */
export function sortRuleEntries(entries: RuleEntry[], locale: Locale): RuleEntry[] {
	return [...entries].sort((a, b) => {
		const aTitle = translate(a.title, locale);
		const bTitle = translate(b.title, locale);
		return aTitle.localeCompare(bTitle, locale);
	});
}
