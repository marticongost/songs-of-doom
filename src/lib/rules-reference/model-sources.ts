import type { LocalisedText } from '$lib/localisation';
import { stats } from '$lib/catalog/models/stats';
import { attributeTypes } from '$lib/catalog/models/stats';
import { entityTypes } from '$lib/catalog/models/properties/entitytypes';
import { focuses } from '$lib/catalog/models/focus';
import { Rule } from '$lib/catalog/models/properties/rule';

/**
 * Maps rule slugs to LocalisedText titles from existing model instances.
 * This is the source of truth for which rule entries have their title derived
 * from a game model rather than SVX front matter.
 */
function buildModelSources(): Record<string, LocalisedText> {
	const sources: Record<string, LocalisedText> = {};

	// Stats — iterate the exported record
	for (const [key, stat] of Object.entries(stats)) {
		sources[key] = stat.name;
	}

	// Entity types — iterate the exported record
	for (const [key, entityType] of Object.entries(entityTypes)) {
		sources[key] = entityType.title;
	}

	// Focuses — skip attribute-based (they duplicate stats)
	for (const [key, focus] of Object.entries(focuses)) {
		if (!(attributeTypes as readonly string[]).includes(key)) {
			sources[key] = focus.title;
		}
	}

	// Rules — auto-discover via import.meta.glob, filtered by instanceof Rule
	const propertyModules = import.meta.glob<{ default: unknown }>(
		'../catalog/data/properties/*.ts',
		{ eager: true }
	);
	for (const [path, mod] of Object.entries(propertyModules)) {
		const instance = mod.default;
		if (instance instanceof Rule) {
			const slug = path.match(/\/([^/]+)\.ts$/)?.[1];
			if (slug) {
				sources[slug] = instance.title;
			}
		}
	}

	return sources;
}

export const modelSources: Record<string, LocalisedText> = buildModelSources();
