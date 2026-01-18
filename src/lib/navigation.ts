import type { Locale, LocalisedText } from './localisation';

export interface SectionProps {
	title: LocalisedText;
	name: string;
	parent?: Section;
	children?: Array<SectionProps>;
}

/**
 * Indicates how a section relates to a given path.
 * - 'selected': The section's path exactly matches the given path.
 * - 'ancestor': The section is an ancestor of the given path.
 * - 'none': The section does not match the given path.
 */
export type PathMatch = 'selected' | 'ancestor' | 'none';

export class Section {
	readonly title: LocalisedText;
	readonly name: string;
	readonly parent?: Section;
	readonly children: Array<Section>;
	readonly depth: number;

	constructor({ title, name, parent, children }: SectionProps) {
		this.title = title;
		this.name = name;
		this.parent = parent;
		this.depth = parent ? parent.depth + 1 : 0;
		this.children = (children ?? []).map(
			(childProps) => new Section({ ...childProps, parent: this })
		);
	}

	/**
	 * Returns the complete path for this section.
	 */
	get path(): string {
		if (this.parent) {
			const parentPath = this.parent.path;
			return parentPath === '/' ? `/${this.name}` : `${parentPath}/${this.name}`;
		}
		return `/${this.name}`;
	}

	/**
	 * Indicates if the section matches the given path.
	 * @param path The path to match against.
	 * @returns 'selected' if the path matches exactly, 'ancestor' if this section is an ancestor of the path, or 'none' otherwise.
	 */
	match(path: string): PathMatch {
		const sectionPath = this.path.replace(/\/$/, '');
		const normalizedPath = path.replace(/\/$/, '');
		if (normalizedPath === sectionPath) {
			return 'selected';
		}
		if (normalizedPath.startsWith(`${sectionPath}/`)) {
			return 'ancestor';
		}
		return 'none';
	}

	/**
	 * Returns a qualified name by concatenating non-empty names from root to this section.
	 * @param separator The separator to use between name segments.
	 * @returns The qualified name, or an empty string if all names in the chain are empty.
	 */
	getQualifiedName(separator: string): string {
		const parentQualified = this.parent?.getQualifiedName(separator) ?? '';
		if (!this.name) return parentQualified;
		if (!parentQualified) return this.name;
		return `${parentQualified}${separator}${this.name}`;
	}
}

/**
 * Extracts the section path from a full URL pathname by stripping the locale prefix.
 * @param pathname The full URL pathname (e.g., '/ca/cards').
 * @param locale The current locale.
 * @returns The section path without the locale prefix (e.g., '/cards').
 */
export const getSectionPathName = (pathname: string, locale: Locale): string =>
	pathname.replace(`/${locale}`, '');

export const siteTree = new Section({
	name: '',
	title: {
		ca: 'Inici',
		es: 'Inicio',
		en: 'Home'
	},
	children: [
		{
			name: 'cards',
			title: {
				ca: 'Cartes',
				es: 'Cartas',
				en: 'Cards'
			}
		}
	]
});
