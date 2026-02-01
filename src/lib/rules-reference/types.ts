import type { Component } from 'svelte';
import type { Locale, LocalisedText } from '$lib/localisation';

/** Front matter shape produced by mdsvex from .svx files */
export interface SvxFrontMatter {
	title?: string;
	[key: string]: unknown;
}

/** A compiled mdsvex module (default export + front matter metadata) */
export interface SvxModule {
	default: Component;
	metadata: SvxFrontMatter;
}

/** A fully resolved rule entry ready for rendering */
export interface RuleEntry {
	/** URL-safe identifier, used as the hash anchor (e.g., 'weapon') */
	slug: string;
	/** Localised title — from model for model-sourced entries, from front matter for ad-hoc */
	title: LocalisedText;
	/** Map of locale to compiled SVX body component */
	bodies: Partial<Record<Locale, Component>>;
}
