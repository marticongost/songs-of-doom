import { rulesIndex, sortRuleEntries } from '$lib/rules-reference';
import type { RuleEntry } from '$lib/rules-reference/types';
import { translate, type Locale } from '$lib/localisation';

interface RulesReferencePageData {
	title: string;
	entries: Array<RuleEntry>;
	locale: Locale;
}

export const load = ({ params }: { params: { locale: Locale } }): RulesReferencePageData => {
	return {
		title: translate(
			{ ca: 'Referència de regles', es: 'Referencia de reglas', en: 'Rules Reference' },
			params.locale
		),
		entries: sortRuleEntries(rulesIndex, params.locale),
		locale: params.locale
	};
};
