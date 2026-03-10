/**
 * Deterministically transforms Svelte components with SCSS stylesheets to use @emotion/css.
 *
 * Handles:
 *   - Simple class selectors: .foo { ... }
 *   - Comma-separated selectors: .foo, .bar { ... }
 *   - Descendant selectors with class base: .foo .bar { ... }
 *   - Suffix selectors: .foo:hover, .foo[data-x='y'], .foo:not(.bar)
 *   - @include rz.xxx(yyy) → ...xxx('yyy') mapped to $lib/css named helpers
 *   - rz.size(xxx) / rz.padding('xxx') / rz.margin('xxx') in values → css.spacing.xxx
 *   - :global(x) → x (nested element selectors, e.g. :global(p) → p)
 *   - @media blocks
 *   - standardAttributes(attrs, 'base') → standardAttributes(attrs, styles.base)
 *
 * Warns and skips:
 *   - @each, @keyframes, @for loops (SCSS-specific)
 *   - SCSS variables ($foo)
 *   - Top-level selectors not starting with a class (.foo)
 *   - :global(element) rules where the inner selector is not a class (e.g. :global(p))
 *
 * Usage (run from packages/web/):
 *   npx tsx scripts/transform-styles.ts <file-or-glob> [...]
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import fg from 'fast-glob';

const WEB_DIR = path.resolve(import.meta.dirname, '..');

// ─── SCSS Parsing ─────────────────────────────────────────────────────────────

interface Rule {
	selector: string;
	declarations: string[];
	nested: Rule[];
}

/**
 * Split a SCSS body into top-level declarations (before any `{`) and
 * nested rules. Tracks string literals and brace depth.
 */
function splitBody(body: string): { declarations: string[]; nested: Rule[] } {
	const declarations: string[] = [];
	const nested: Rule[] = [];

	let chunk = '';
	let i = 0;
	let inString = false;
	let stringChar = '';

	while (i < body.length) {
		const ch = body[i];

		if (inString) {
			chunk += ch;
			if (ch === stringChar && body[i - 1] !== '\\') inString = false;
			i++;
			continue;
		}

		if (ch === '"' || ch === "'") {
			inString = true;
			stringChar = ch;
			chunk += ch;
			i++;
			continue;
		}

		// SCSS interpolation #{...} — treat as opaque token, not a nested rule
		if (ch === '#' && body[i + 1] === '{') {
			chunk += '#';
			i++;
			chunk += '{';
			i++;
			let depth = 1;
			while (i < body.length && depth > 0) {
				if (body[i] === '{') depth++;
				else if (body[i] === '}') depth--;
				chunk += body[i];
				i++;
			}
			continue;
		}

		if (ch === '{') {
			// chunk up to here is the selector for a nested rule
			const selector = chunk.trim();
			chunk = '';
			i++;

			// Collect the body (handle nested braces)
			let nestedBody = '';
			let depth = 1;
			while (i < body.length && depth > 0) {
				if (body[i] === '{') depth++;
				else if (body[i] === '}') depth--;
				if (depth > 0) nestedBody += body[i];
				i++;
			}

			if (selector) {
				const { declarations: d, nested: n } = splitBody(nestedBody);
				nested.push({ selector, declarations: d, nested: n });
			}
			continue;
		}

		if (ch === ';') {
			const decl = chunk.trim();
			if (decl) declarations.push(decl);
			chunk = '';
			i++;
			continue;
		}

		chunk += ch;
		i++;
	}

	const remaining = chunk.trim();
	if (remaining) declarations.push(remaining);

	return { declarations, nested };
}

/** Parse the content of a `<style>` block into top-level rules. */
function parseTopLevel(scss: string): Rule[] {
	// Strip @use declarations and comments
	const cleaned = scss
		.replace(/@use\s+[^\n]+;/g, '')
		.replace(/\/\/[^\n]*/g, '')
		.replace(/\/\*[\s\S]*?\*\//g, '');

	return splitBody(cleaned).nested;
}

// ─── SCSS → Emotion Conversion ────────────────────────────────────────────────

/**
 * Maps SCSS rz.* mixin names (camelCase) to their $lib/css named helper equivalents.
 * Unmapped mixins are emitted as TODO comments.
 */
const MIXIN_MAP: Record<string, string> = {
	row: 'row',
	column: 'column',
	grid: 'grid',
	hpadding: 'hpadding',
	vpadding: 'vpadding',
	hmargin: 'hmargin',
	vmargin: 'vmargin'
};

function kebabToCamel(s: string): string {
	return s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function cssPropertyToJs(property: string): string {
	if (property.startsWith('--')) return `'${property}'`; // CSS custom property
	return kebabToCamel(property);
}

/**
 * Namespace exports from $lib/styles (i.e. `export * as foo from './foo'`).
 * CSS variables matching `var(--namespace-property)` for these namespaces are
 * converted to `css.namespace.camelCase(property)`.
 */
const CSS_NAMESPACES = new Set(['text', 'fonts', 'palette', 'focus']);

/**
 * Explicit mappings for CSS variables whose naming doesn't follow the
 * `--namespace-property` convention (e.g. `--heading-font` → `css.fonts.heading`).
 */
const CSS_VAR_MAP: Record<string, string> = {
	'--heading-font': 'css.fonts.heading',
	'--number-font': 'css.fonts.number'
};

/** Convert a SCSS value string to a JS value string for emotion. */
function convertValue(value: string): string {
	// Strip SCSS interpolation wrapper #{...} and convert the inner expression
	const interpolated = value.match(/^#\{(.+)\}$/);
	if (interpolated) return convertValue(interpolated[1]);

	// rz.size(xxx) / rz.padding('xxx') / rz.margin('xxx') → css.spacing.xxx
	const withRz = value.replace(
		/\brz\.(size|padding|margin)\(['"]?(\w+)['"]?\)/g,
		(_, _fn: string, arg: string) => `css.spacing.${arg}`
	);
	if (withRz !== value) return withRz; // contains a JS call — raw expression

	// Explicit CSS variable overrides (e.g. var(--heading-font) → css.fonts.heading)
	const explicitVarMatch = value.match(/^var\((--[\w-]+)\)$/);
	if (explicitVarMatch && CSS_VAR_MAP[explicitVarMatch[1]]) {
		return CSS_VAR_MAP[explicitVarMatch[1]];
	}

	// var(--namespace-property) → css.namespace.camelCase(property)
	const varMatch = value.match(/^var\(--([a-z]+)-([\w-]+)\)$/);
	if (varMatch && CSS_NAMESPACES.has(varMatch[1])) {
		return `css.${varMatch[1]}.${kebabToCamel(varMatch[2])}`;
	}
	// Everything else is a CSS string
	return `'${value}'`;
}

/**
 * Spacing mixins that set a single CSS property to a spacing value.
 * e.g. `@include rz.padding(xs)` → `padding: css.spacing.xs`
 */
const SPACING_MIXIN_MAP: Record<string, string> = {
	padding: 'padding',
	margin: 'margin'
};

/** Convert an `@include rz.xxx(yyy)` declaration to a spread expression string. */
function convertInclude(decl: string): string | null {
	// With parentheses: @include rz.xxx(arg, ...)
	const m = decl.match(/^@include\s+rz\.([\w-]+)\(([^)]*)\)\s*$/);
	if (m) {
		const name = kebabToCamel(m[1]);
		const rawArgs = m[2].trim();
		const helper = MIXIN_MAP[name];
		const args = rawArgs
			? rawArgs.split(',').map((a) => {
					a = a.trim();
					return a.startsWith('$') ? `/* TODO: ${a} */` : `'${a}'`;
				})
			: [];
		if (helper) {
			return `...css.${helper}(${args.join(', ')})`;
		}
		// Spacing mixins: @include rz.padding(xs) → padding: css.spacing.xs
		const cssProp = SPACING_MIXIN_MAP[name];
		if (cssProp && args.length === 1 && !args[0].startsWith('/*')) {
			const key = args[0].replace(/^'|'$/g, '');
			return `${cssProp}: css.spacing.${key}`;
		}
		const argsStr = args.length ? args.join(', ') : '';
		return `/* TODO: ...rz.${name}(${argsStr}) */`;
	}
	// Without parentheses: @include rz.xxx
	const m2 = decl.match(/^@include\s+rz\.([\w-]+)\s*$/);
	if (m2) {
		const name = kebabToCamel(m2[1]);
		const helper = MIXIN_MAP[name];
		if (helper) {
			return `...css.${helper}()`;
		}
		return `/* TODO: ...rz.${name}() */`;
	}
	return null;
}

/** Convert a single SCSS declaration string to JS. Returns null to skip. */
function convertDeclaration(decl: string, warnings: string[]): string | null {
	decl = decl.trim();
	if (!decl) return null;

	// rz include
	const include = convertInclude(decl);
	if (include !== null) return include;

	// Other @-rules inside declarations (shouldn't happen at declaration level, but guard)
	if (decl.startsWith('@')) {
		warnings.push(`Skipped at-rule in declarations: ${decl.slice(0, 60)}`);
		return `/* TODO: ${decl.replace(/\*\//g, '* /').slice(0, 80)} */`;
	}

	// SCSS variable assignment
	if (decl.startsWith('$')) {
		warnings.push(`Skipped SCSS variable: ${decl.slice(0, 60)}`);
		return `/* TODO SCSS var: ${decl.replace(/\*\//g, '* /').slice(0, 60)} */`;
	}

	// Regular property: value
	const colonIdx = decl.indexOf(':');
	if (colonIdx !== -1) {
		const prop = decl.slice(0, colonIdx).trim();
		const value = decl
			.slice(colonIdx + 1)
			.trim()
			.replace(/;$/, '');
		return `${cssPropertyToJs(prop)}: ${convertValue(value)}`;
	}

	warnings.push(`Unhandled declaration: ${decl.slice(0, 60)}`);
	return `/* TODO: ${decl.replace(/\*\//g, '* /').slice(0, 80)} */`;
}

/** Convert a nested SCSS selector to its emotion equivalent. */
function convertNestedSelector(selector: string): string {
	// :global(expr) → expr  (emotion styles are global, no scoping attribute needed)
	return selector.replace(/:global\(([^)]+)\)/g, (_, inner: string) => inner.trim());
}

/** Recursively emit lines for the body of an emotion css({}) call. */
function emitBodyLines(rule: Rule, indent: string, warnings: string[]): string[] {
	const lines: string[] = [];

	// Declarations
	for (const decl of rule.declarations) {
		const js = convertDeclaration(decl, warnings);
		if (js !== null) lines.push(`${indent}${js},`);
	}

	// Nested rules
	for (const n of rule.nested) {
		const sel = n.selector.trim();

		// Skip complex SCSS at-rules
		if (/^@(each|keyframes|for|while)\b/.test(sel)) {
			warnings.push(`Skipped: ${sel.slice(0, 60)} { ... }`);
			lines.push(`${indent}/* TODO: ${sel.replace(/\*\//g, '* /').slice(0, 80)} { ... } */`);
			continue;
		}

		// @media block
		if (sel.startsWith('@media')) {
			lines.push(`${indent}'${sel}': {`);
			lines.push(...emitBodyLines(n, indent + '\t', warnings));
			lines.push(`${indent}},`);
			continue;
		}

		const emotionSel = convertNestedSelector(sel);
		const key = `"${emotionSel.replace(/"/g, '\\"')}"`;
		lines.push(`${indent}${key}: {`);
		lines.push(...emitBodyLines(n, indent + '\t', warnings));
		lines.push(`${indent}},`);
	}

	return lines;
}

// ─── Selector Parsing ─────────────────────────────────────────────────────────

/** Extract the leading CSS class name from a selector, or null if none. */
function extractLeadingClass(selector: string): string | null {
	const m = selector.match(/^\.([a-zA-Z][\w-]*)/);
	return m ? m[1] : null;
}

interface SelectorIntent {
	baseClass: string; // e.g. 'foo' from '.foo'
	suffix: string; // e.g. ':hover' from '.foo:hover', '' for plain '.foo'
	/** True when there was a space before the suffix → descendant combinator (`& .bar`).
	 *  False → modifier on the same element (`&:hover`, `&.bar`, `&[attr]`). */
	descendant: boolean;
}

function parseSelectorIntent(selector: string): SelectorIntent | null {
	const baseClass = extractLeadingClass(selector);
	if (!baseClass) return null;
	const rawRest = selector.slice(`.${baseClass}`.length); // preserves leading whitespace
	const descendant = rawRest.length > 0 && rawRest[0] === ' ';
	return { baseClass, suffix: rawRest.trim(), descendant };
}

// ─── HTML Template Updating ───────────────────────────────────────────────────

function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * In the template string, replace occurrences of `class="cssClass"` with
 * `class={styles.styleName}`, and update `standardAttributes(x, 'cssClass')`
 * to `standardAttributes(x, styles.styleName)`.
 */
function applyClassReplacement(template: string, cssClass: string, styleName: string): string {
	// standardAttributes(x, 'cssClass')
	template = template.replace(
		new RegExp(`standardAttributes\\(([^,]+),\\s*'${escapeRegex(cssClass)}'\\)`, 'g'),
		(_, arg) => `standardAttributes(${arg}, styles.${styleName})`
	);

	// class="cssClass otherClass" — cssClass first
	template = template.replace(
		new RegExp(`class="${escapeRegex(cssClass)} ([^"]+)"`, 'g'),
		(_, rest) => `class={\`\${styles.${styleName}} ${rest}\`}`
	);

	// class="otherClass cssClass" — cssClass last
	template = template.replace(
		new RegExp(`class="([^"]+) ${escapeRegex(cssClass)}"`, 'g'),
		(_, rest) => `class={\`${rest} \${styles.${styleName}}\`}`
	);

	// class="cssClass" — exact match
	template = template.replace(
		new RegExp(`class="${escapeRegex(cssClass)}"`, 'g'),
		`class={styles.${styleName}}`
	);

	return template;
}

// ─── Module Script ────────────────────────────────────────────────────────────

function buildModuleScript(template: string, styleEntries: string[], useCx: boolean): string {
	const cssImport = `import * as css from '$lib/styles';`;
	const cxImport = useCx ? `import { cx } from '@emotion/css';` : null;
	const imports = [cssImport, cxImport].filter(Boolean).join('\n');
	const stylesBlock = `const styles = css.styles({\n${styleEntries.join(',\n')}\n});`;

	// Extend existing module script if present
	const existing = template.match(/(<script\s+lang="ts"\s+module\s*>)([\s\S]*?)(<\/script>)/);
	if (existing) {
		const newBody = `\n${imports}\n\n${stylesBlock}\n${existing[2]}`;
		return template.replace(existing[0], `${existing[1]}${newBody}${existing[3]}`);
	}

	// Prepend a new module script, keeping any leading <!-- @component --> doc comment at the top
	const docCommentMatch = template.match(/^(<!--[\s\S]*?-->\n*)/);
	if (docCommentMatch) {
		const docComment = docCommentMatch[1];
		const rest = template.slice(docComment.length);
		return `${docComment}<script lang="ts" module>\n${imports}\n\n${stylesBlock}\n</script>\n\n${rest}`;
	}
	return `<script lang="ts" module>\n${imports}\n\n${stylesBlock}\n</script>\n\n${template}`;
}

// ─── File Transformation ──────────────────────────────────────────────────────

async function transformFile(filePath: string): Promise<void> {
	const original = await fs.readFile(filePath, 'utf-8');

	const styleMatch = original.match(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/);
	if (!styleMatch) {
		console.log('  (no stylesheet, skipping)');
		return;
	}

	const styleBlock = styleMatch[0];
	const styleContent = styleBlock.replace(/^<style[^>]*>/, '').replace(/<\/style>$/, '');

	const topRules = parseTopLevel(styleContent);
	if (topRules.length === 0) {
		// Empty stylesheet — just remove it
		const updated = original.replace(styleBlock, '').trimEnd() + '\n';
		await fs.writeFile(filePath, updated, 'utf-8');
		execSync(`npx prettier --write ${JSON.stringify(filePath)}`, { cwd: WEB_DIR, stdio: 'pipe' });
		console.log('  ✓ empty stylesheet removed');
		return;
	}

	const warnings: string[] = [];

	// Group rules by their base CSS class name.
	// e.g. '.foo { }' and '.foo:hover { }' both belong to 'foo'.
	// '.foo .bar { }' also belongs to 'foo' (as a descendant selector).
	const groups = new Map<string, Rule>(); // baseClass → merged Rule

	for (const rule of topRules) {
		// Handle comma-separated selectors by splitting
		const selectors = rule.selector
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);

		for (const sel of selectors) {
			// :global(.foo) — extract the inner class and treat as a regular class selector.
			// Only skip if the inner content is not a class selector (e.g. :global(p)).
			let effectiveSel = sel;
			if (sel.startsWith(':global(') && sel.endsWith(')')) {
				effectiveSel = sel.slice(':global('.length, -1).trim();
				if (!effectiveSel.startsWith('.')) {
					warnings.push(`Skipped global selector: ${sel}`);
					continue;
				}
			}

			const intent = parseSelectorIntent(effectiveSel);
			if (!intent) {
				warnings.push(`Skipped non-class selector: ${sel}`);
				continue;
			}

			const { baseClass, suffix, descendant } = intent;

			// Get or create the merged rule for this class
			if (!groups.has(baseClass)) {
				groups.set(baseClass, { selector: `.${baseClass}`, declarations: [], nested: [] });
			}
			const merged = groups.get(baseClass)!;

			if (!suffix) {
				// Direct styles for this class
				merged.declarations.push(...rule.declarations);
				merged.nested.push(...rule.nested);
			} else {
				// descendant: `.foo .bar` → `& .bar`
				// modifier:   `.foo:hover` → `&:hover`, `.foo.bar` → `&.bar`
				const nestedSel = descendant ? `& ${suffix}` : `&${suffix}`;
				merged.nested.push({
					selector: nestedSel,
					declarations: rule.declarations,
					nested: rule.nested
				});
			}
		}
	}

	if (groups.size === 0) {
		console.log('  (no convertible rules)');
		if (warnings.length > 0) for (const w of warnings) console.log(`    ⚠ ${w}`);
		return;
	}

	// Convert each group to an emotion CSS object entry
	const styleEntries: string[] = [];
	for (const [baseClass, rule] of groups) {
		const styleName = kebabToCamel(baseClass);
		const bodyLines = emitBodyLines(rule, '\t\t', warnings);
		const entry = `\t${styleName}: {\n${bodyLines.join('\n')}\n\t}`;
		styleEntries.push(entry);
	}

	// Remove the style block, then update class references in the template
	let template = original.replace(styleBlock, '');

	for (const [baseClass] of groups) {
		const styleName = kebabToCamel(baseClass);
		template = applyClassReplacement(template, baseClass, styleName);
	}

	// Add / extend the module script
	const result = buildModuleScript(template, styleEntries, false);

	await fs.writeFile(filePath, result, 'utf-8');
	execSync(`npx prettier --write ${JSON.stringify(filePath)}`, { cwd: WEB_DIR, stdio: 'pipe' });

	if (warnings.length > 0) for (const w of warnings) console.log(`    ⚠ ${w}`);
	console.log('  ✓ done');
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
	const patterns = process.argv.slice(2);
	if (patterns.length === 0) {
		console.error('Usage: npx tsx scripts/transform-styles.ts <file-or-glob> [...]');
		process.exit(1);
	}

	const files = await fg(patterns, { cwd: WEB_DIR, absolute: true });
	if (files.length === 0) {
		console.error('No files matched.');
		process.exit(1);
	}

	for (const file of files) {
		console.log(path.relative(WEB_DIR, file));
		try {
			await transformFile(file);
		} catch (err) {
			console.error(`  ✗ ${err}`);
		}
	}
}

main();
