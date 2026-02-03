---
name: add-property
description: Create or update a Property data file (Keyword, Rule, ScalarRule, or EntityType) and optionally add a rules reference entry.
---

# Add a new property

## When to use this skill

Use this skill when the user needs to add a new property to the game or edit an existing one. Properties are boolean expressions that can be assigned to entities (items, traits, skills, etc.) and used in conditions and effects.

## Property types

The property system has the following class hierarchy:

```
Property (abstract, extends BooleanExpression)
├── Keyword          — simple flag that triggers other cards' abilities
├── Rule             — game rule with a description
│   ├── ParametricRule<P>   — rule template with parameters
│   │   └── ScalarRule      — ParametricRule<{ value: number }>
│   └── ParametricRuleInstance<P>  — created via rule.with(params)
└── EntityType       — pre-defined singletons (archetype, trait, skill, item, creature, ally)
```

### Keyword

A simple flag property. Description is auto-generated (Catalan, Spanish, English).

```typescript
import { Keyword } from '$lib/catalog/models/properties';

export default new Keyword({
	title: { ca: 'Armadura', es: 'Armadura', en: 'Armor' }
});
```

### Rule

A game rule with a localised description explaining its effect.

```typescript
import { Rule } from '$lib/catalog/models/properties/rule';

export default new Rule({
	title: {
		ca: 'Projectil',
		es: 'Proyectil',
		en: 'Projectile'
	}
});
```

### ScalarRule

A parametric rule template that takes a numeric value. Entities use it via `.with({ value })`.

```typescript
import { ScalarRule } from '$lib/catalog/models/properties';

export default new ScalarRule({
	title: {
		ca: 'Resistència',
		es: 'Resistencia',
		en: 'Toughness'
	}
});
```

Usage in entity data files:

```typescript
import toughness from '../../properties/toughness';

// In a capability or effect:
toughness.with({ value: 2 });
```

### EntityType

EntityTypes are pre-defined singletons in `src/lib/catalog/models/properties/entitytypes.ts`. Adding a new EntityType requires updating:

1. The `EntityTypeId` union type
2. The singleton export
3. The `entityTypes` record

This is rare and should be discussed with the user before proceeding.

## Data file conventions

- **Location**: `src/lib/catalog/data/properties/{slug}.ts`
- **File name**: lowercase, hyphenated slug (e.g. `toughness.ts`, `projectile.ts`)
- **Export**: `export default new {PropertyClass}({ ... })`
- **Import path for classes**:
  - `Keyword`: import from `'$lib/catalog/models/properties'`
  - `Rule`: import from `'$lib/catalog/models/properties/rule'`
  - `ScalarRule`: import from `'$lib/catalog/models/properties'`
- **Localisation**: provide `title` in `ca`, `es`, `en` order
- **Description** (Rule only): provide `description` in `ca`, `es`, `en` order

## Rules reference integration

Rules (including ScalarRules) are **auto-discovered** by `src/lib/rules-reference/model-sources.ts` via `import.meta.glob`. When you create a Rule or ScalarRule data file, its title is automatically available to the rules reference system — no manual registration needed. Keywords are **not** auto-discovered (they are not `instanceof Rule`).

## Tasks

When the user requests a new property:

1. **Determine the property type**: If the property is given in a "{description} (X)}" form, assume it to be a ScalarRule. If not, ask the user whether it should be a Keyword, Rule, ScalarRule, or EntityType. Key questions:
   - Is it a rule with intrinsic in-game effects?
     - Does it carry a single numeric parameter? → ScalarRule
     - Does it have multiple parameters → ParametricRule
   - Does it have no parameters? → Rule
   - Is it a simple flag/tag? → Keyword
   - Is it a new entity category? → EntityType (rare)

2. **Create (or edit) the data file** in `src/lib/catalog/data/properties/`:
   - Use the slug as the file name (e.g. `piercing.ts`)
   - Export default with the appropriate class and localised fields

3. **Rules reference entry** (non-Keyword properties only):
   - For Rule, ParametricRule, ScalarRule and EntityType properties, invoke the `/update-rules-reference` skill to create a rules reference entry
   - The entry will be model-sourced (title auto-resolved from the Rule instance), so entry files should **not** include a title export
   - Only the body content (explanation, examples, cross-links) is needed in the entry files

4. **Format**: Run `npm run format` to ensure consistent formatting via Prettier
5. **Check**: Run `npm run check` and `npm run lint` to validate the changes
