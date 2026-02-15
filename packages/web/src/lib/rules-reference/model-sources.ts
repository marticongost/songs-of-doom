import {
	focuses,
	ScalarRule,
	entityTypes,
	Rule,
	attributeTypes,
	stats,
	propertyData
} from '@songsofdoom/game';
import type { Locale, LocalisedText } from '@songsofdoom/common/localisation';

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
			sources[`${key}-focus`] = focus.title;
		}
	}

	// Rules — iterate exported property data, filtered by instanceof Rule
	for (const [slug, instance] of Object.entries(propertyData)) {
		if (instance instanceof Rule) {
			const title: LocalisedText = { ...instance.title };
			if (instance instanceof ScalarRule) {
				for (const [key, value] of Object.entries(title)) {
					title[key as Locale] = `${value} (X)`;
				}
			}
			sources[slug] = title;
		}
	}

	return sources;
}

export const modelSources: Record<string, LocalisedText> = buildModelSources();
