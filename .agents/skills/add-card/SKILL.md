---
name: add-card
description: Create new game cards from a textual description — determine card type, assign id, pick parent, design capabilities, create the data file, and generate artwork.
---

# Add a new card

## When to use this skill

Use this skill when the user wants to add a new card to the game from a textual description. The skill walks through design decisions, creates the TypeScript data file, and kicks off image generation.

## Step 1 — Determine the card type

Ask the user to clarify which entity type the card belongs to if it is not obvious from the description:

| Class        | File location                   | Description                                                 |
| ------------ | ------------------------------- | ----------------------------------------------------------- |
| `Trait`      | `data/archetypes/**/{id}.ts`    | Passive or reactive card tied to an archetype or discipline |
| `Skill`      | `data/disciplines/**/{id}.ts`   | Active card tied to a discipline or archetype               |
| `Item`       | `data/items/**/{id}.ts`         | Equipment with a slot (weapon, armor, shield, etc.)         |
| `Archetype`  | `data/archetypes/{id}/{id}.ts`  | Root archetype card                                         |
| `Discipline` | `data/disciplines/{id}/{id}.ts` | Root discipline card                                        |
| `Creature`   | `data/modules/**/{id}.ts`       | Enemy encountered in a module                               |
| `Ally`       | `data/allies/{id}.ts`           | Friendly NPC card                                           |

Check which types already exist by reading `packages/game/src/models/entities/` if needed.

## Step 2 — Choose the card's parent

The card's file path encodes its parent relationship:

- **Skills and Traits inside a discipline**: `data/disciplines/{discipline}/{card-id}.ts`
- **Skills and Traits inside an archetype**: `data/archetypes/{archetype}/{card-id}.ts`
- **Skills and Traits inside a sub-archetype**: `data/archetypes/{archetype}/{sub}/{card-id}.ts`
- **Items in a category**: `data/items/{category}/{card-id}.ts`
- **Creatures in a module**: `data/modules/{module}/{card-id}.ts`

Browse the `packages/game/src/data/` directory to pick an appropriate parent. If no parent exists yet, ask the user before creating one.

## Step 3 — Assign a unique id

The card's id is derived from its file name (kebab-case). Check the target directory for existing names to avoid collisions:

```bash
ls packages/game/src/data/{parent-path}/
```

Choose a short, descriptive, lowercase kebab-case name (e.g. `quick-reflexes`, `iron-will`, `dark-dagger`).

## Step 4 — Decide on variants

- Default to **2 variants** using `upgradable(EntityClass, 2, ...)`:
  - Variant 1: free (`xpCost: 0`)
  - Variant 2: improved version (`xpCost: 1` or more as appropriate)
- Use `variants.values(v1, v2)` to express per-variant values.
- Use `variants.ifMatches(2, ...)` to include items only at level 2.
- If the card is naturally a one-shot (e.g. a simple item), use `new EntityClass({...})` directly with no variants.

## Step 5 — Design capabilities

Map the card's effects to the four capability types:

| Class         | Import                | Usage                                          |
| ------------- | --------------------- | ---------------------------------------------- |
| `Action`      | `models/capabilities` | Player actively triggers during their turn     |
| `Opportunity` | `models/capabilities` | Optional reaction when a trigger event occurs  |
| `Obligation`  | `models/capabilities` | Mandatory reaction when a trigger event occurs |
| `Constant`    | `models/capabilities` | Always-on permanent effect; no trigger needed  |

### Capability cost

Express cost as a plain object on the `cost` property:

```typescript
cost: { agility: 1 }               // spend 1 agility focus
cost: { strength: 2, agility: 1 }  // spend 2 strength + 1 agility
cost: { cardTransition: 'exhaust' } // exhaust the card
cost: { cardTransition: 'discard' } // discard the card
```

### Trigger events (for Opportunity / Obligation)

Common event type strings: `'attack'`, `'payingCapability'`, `'startOfTurn'`, `'endOfTurn'`, `'movement'`. Look up available events in `packages/game/src/models/event.ts` if needed.

```typescript
new Opportunity({
    triggers: [{ event: 'attack', condition: reactivePlayerIsSubject }],
    cost: { agility: 1 },
    effects: [...]
})
```

## Step 6 — Select or create effects

Before using any effect, check `packages/game/src/models/effects/index.ts` for existing factory functions. Common ones:

| Factory                       | Description                            |
| ----------------------------- | -------------------------------------- |
| `attack(props)`               | Trigger a standard attack              |
| `triggerAttack(props)`        | Trigger an attack with modifiers       |
| `wound(amount)`               | Deal wound damage                      |
| `heal(amount)`                | Heal health                            |
| `modifyDamage(amount)`        | Modify damage of an in-progress attack |
| `modifyRoll(modifier)`        | Modify a dice roll                     |
| `modifyCapabilityCost(props)` | Reduce or increase capability cost     |
| `conferProperties(props)`     | Grant keyword properties               |
| `changeStats(props)`          | Change character stats                 |
| `drawCards(amount)`           | Draw cards                             |
| `drawFocus(props)`            | Draw focus tokens                      |
| `exhaust(props)`              | Exhaust a card                         |
| `discard(props)`              | Discard a card                         |
| `engage()`                    | Engage an opponent                     |
| `resultsTable(props)`         | Branch on dice result                  |
| `talent(talents)`             | Grant talents                          |
| `transformFocus(props)`       | Convert focus to another type          |
| `sanityLoss(amount)`          | Lose sanity                            |
| `recoverSanity(props)`        | Recover sanity                         |

If no existing effect matches the desired behaviour, use the `/add-effect` skill to create one before continuing.

## Step 7 — Write the data file

### Template: Skill or Trait with 2 variants

```typescript
import { Action } from '../../../models/capabilities'; // or Opportunity / Obligation / Constant
import { modifyDamage, wound } from '../../../models/effects'; // add required effects
import { Skill } from '../../../models/entities/skill'; // or Trait
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Títol en català',
		es: 'Título en español',
		en: 'Title in English'
	},
	xpCost: variants.values(0, 2),
	capabilities: [
		new Action({
			id: 'wound',
			cost: { agility: 1 },
			effects: [wound(variants.values(1, 2))]
		})
	]
}));
```

### Template: Item (no variants by default)

```typescript
import { Action } from '../../../models/capabilities';
import { wound } from '../../../models/effects';
import { Item } from '../../../models/entities/item';

export default new Item({
	title: {
		ca: 'Nom en català',
		es: 'Nombre en español',
		en: 'Name in English'
	},
	slot: 'weapon', // weapon | offhand | chest | head | feet | hands | trinket
	goldCost: 4,
	capabilities: [
		new Action({
			id: 'wound',
			cost: { agility: 1 },
			effects: [wound(2)]
		})
	]
});
```

### Template: Trait with 2 variants

```typescript
import { Opportunity } from '../../../models/capabilities';
import { modifyCapabilityCost } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { upgradable } from '../../../models/upgrades';
import { reactivePlayerIsSubject } from '../../../models/expressions';

export default upgradable(Trait, 2, (variants) => ({
	title: {
		ca: 'Títol en català',
		es: 'Título en español',
		en: 'Title in English'
	},
	xpCost: variants.values(0, 3),
	capabilities: [
		new Opportunity({
			triggers: [{ event: 'attack', condition: reactivePlayerIsSubject }],
			effects: [modifyCapabilityCost({ cost: { strength: variants.values(-1, -2) } })]
		})
	]
}));
```

### Import paths

Data files import from relative paths. The depth depends on nesting:

| Level  | Example path                                | Relative prefix       |
| ------ | ------------------------------------------- | --------------------- |
| 1 deep | `data/items/sword.ts`                       | `../../models/`       |
| 2 deep | `data/disciplines/might/iron-will.ts`       | `../../../models/`    |
| 3 deep | `data/archetypes/warrior/barbarian/rage.ts` | `../../../../models/` |

## Step 8 — Validate

After writing the file, run the post-implementation checks from the workspace root:

```bash
npm run lint && npm run check && npm run test
```

Fix any errors. Do not suppress linting issues silently.

## Step 9 — Generate card artwork

Use the `/generate-images` skill to create the card's image. Describe the card visually based on its title, capabilities, and effects:

- **Subject**: the central figure or object
- **Action**: what is happening or the mood conveyed
- **Visual details**: equipment, environment, lighting
- **Style cues**: angle, framing, atmosphere

Keep the description to 2–4 sentences. Avoid abstract game mechanic language — translate it into imagery.
