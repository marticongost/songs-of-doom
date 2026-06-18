/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Counter,
	findConstructors,
	isConcreteSubclassOf,
	ReadonlyCounter,
	Serialisation,
	type JSONValue,
	type Type
} from '@songsofdoom/common';
import * as Game from '@songsofdoom/game';
import {
	BooleanField,
	CapabilityField,
	EntityField,
	FocusesField,
	PaymentField,
	ResultField,
	TargetField
} from './core/input';
import type { JournalEntry } from './core/journal';
import type { ProcedureState } from './core/procedure';
import { ReadonlyAttackResolution } from './state/attackresolution';
import { ReadonlyCapabilityResolution } from './state/capabilityresolution';
import { ReadonlyCardState } from './state/cardstate';
import { ReadonlyGameState } from './state/gamestate';
import { ReadonlyLocationState } from './state/locationstate';
import { ReadonlyPlayerState } from './state/playerstate';
import { ReadonlyTestResolution } from './state/testresolution';
import { ReadonlyWoundResolution } from './state/woundresolution';

// ---------------------------------------------------------------------------
// Serialisation context for resolving external references
// ---------------------------------------------------------------------------

/**
 * Context passed to {@link engineSerialisation.serialise} and
 * {@link engineSerialisation.deserialise} to resolve external references
 * for Entity, Property, Talent, Stat, Event, Focus, and Slot objects.
 */
export interface EngineSerialisationContext {
	/** Obtains the key for a given property. */
	getPropertyKey: (prop: Game.Property) => string | undefined;

	/** Resolves an entity by its catalog ID (from {@link getEntryMetadata}). */
	resolveEntity: (id: string) => Game.Entity | undefined;

	/** Resolves a property by its stable key. */
	resolveProperty: (key: string) => Game.Property | undefined;

	/** Resolves a talent by its ID. */
	resolveTalent: (id: string) => Game.Talent | undefined;

	/** Resolves a stat by its type (e.g. `"strength"`, `"health"`). */
	resolveStat: (id: string) => Game.Stat | undefined;

	/** Resolves an event by its type (e.g. `"attacks"`). */
	resolveEvent: (id: string) => Game.Event | undefined;

	/** Resolves a focus by its type (e.g. `"strength"`, `"heroism"`). */
	resolveFocus: (id: string) => Game.Focus | undefined;

	/** Resolves a slot by its type (e.g. `"hand"`, `"chest"`). */
	resolveSlot: (id: string) => Game.Slot | undefined;
}

// ---------------------------------------------------------------------------
// Serialisation instance
// ---------------------------------------------------------------------------

/**
 * Serialisation instance for the engine package, configured with all domain types
 * that can appear in a {@link JournalEntry} or an input field definition.
 *
 * Game types are auto-detected by scanning `@songsofdoom/game` exports for
 * subclasses of root abstract types ({@link Game.Entity}, {@link Game.Capability},
 * {@link Game.Property}, {@link Game.Effect}, {@link Game.BooleanExpression},
 * {@link Game.ScalarExpression}, {@link Game.Stat}).  A small set of standalone types
 * without a common hierarchy is listed explicitly.
 *
 * Entity, Property, Talent, Stat, Event, Focus, and Slot types use external
 * object identity — only a reference key is stored; the caller provides a
 * {@link EngineSerialisationContext} with lookup functions.
 */
export const engineSerialisation = new Serialisation<EngineSerialisationContext>({
	types: [
		// --- Engine state types (manual — not exported by @songsofdoom/game) ---
		ReadonlyGameState,
		ReadonlyPlayerState,
		ReadonlyCardState,
		ReadonlyLocationState,
		ReadonlyAttackResolution,
		ReadonlyCapabilityResolution,
		ReadonlyTestResolution,
		ReadonlyWoundResolution,

		// --- Input field types ---
		TargetField,
		FocusesField,
		BooleanField,
		CapabilityField,
		ResultField,
		PaymentField,
		EntityField,

		// --- Common types ---
		Counter,
		ReadonlyCounter,

		// --- Game domain ---
		Game.ActualCapabilityCost,
		Game.CapabilityCost,
		Game.CardTransition,
		Game.CharacterState,
		Game.Event,
		Game.EventTrigger,
		Game.Focus,
		Game.Focuses,
		Game.Slot,
		Game.Talent,
		Game.Target,
		Game.TargetCardinality,
		Game.TargetDiscriminator,
		...findConstructors(Game, (type) =>
			isConcreteSubclassOf(type, [
				Game.Entity,
				Game.Capability,
				Game.Property,
				Game.Effect,
				Game.Expression,
				Game.Stat
			])
		)
	],
	typeBranding: (type) => type.name,
	objectIdentity: new Map([
		[
			Game.Entity as Type,
			{
				external: true,
				getObjectId: (entity: Game.Entity) => Game.getEntryMetadata(entity).id,
				resolveExternalReference: (key: string, context) => context.data.resolveEntity(key)
			}
		],
		[
			Game.Property as Type,
			{
				external: true,
				getObjectId: (prop: Game.Property, data: EngineSerialisationContext) =>
					data.getPropertyKey(prop),
				resolveExternalReference: (key: string, context) => context.data.resolveProperty(key)
			}
		],
		[
			Game.Talent as Type,
			{
				external: true,
				getObjectId: (talent: Game.Talent) => talent.id,
				resolveExternalReference: (key: string, context) => context.data.resolveTalent(key)
			}
		],
		[
			Game.Stat as Type,
			{
				external: true,
				getObjectId: (stat: Game.Stat) => stat.type,
				resolveExternalReference: (key: string, context) => context.data.resolveStat(key)
			}
		],
		[
			Game.Event as Type,
			{
				external: true,
				getObjectId: (event: Game.Event) => event.type,
				resolveExternalReference: (key: string, context) => context.data.resolveEvent(key)
			}
		],
		[
			Game.Focus as Type,
			{
				external: true,
				getObjectId: (focus: Game.Focus) => focus.type,
				resolveExternalReference: (key: string, context) => context.data.resolveFocus(key)
			}
		],
		[
			Game.Slot as Type,
			{
				external: true,
				getObjectId: (slot: Game.Slot) => slot.type,
				resolveExternalReference: (key: string, context) => context.data.resolveSlot(key)
			}
		]
	])
});

// ---------------------------------------------------------------------------
// Context factory
// ---------------------------------------------------------------------------

/**
 * Creates an {@link EngineSerialisationContext} backed by the game's catalog
 * and property data.
 *
 * All external reference resolution (entities, properties, talents, stats,
 * events, focuses, slots) is handled internally — no parameters needed.
 */
export function createEngineSerialisationContext(): EngineSerialisationContext {
	// Build property registry from singleton entity-types and property data exports.
	const propertiesByName = new Map<string, Game.Property>();
	const propertyNames = new Map<Game.Property, string>();

	// EntityType singletons
	for (const [id, et] of Object.entries(Game.entityTypes)) {
		propertiesByName.set(id as Game.EntityTypeId, et);
		propertyNames.set(et, id);
	}

	// Property data exports (filter out non-instance exports like rule classes)
	for (const [key, value] of Object.entries(Game.propertyData)) {
		if (value instanceof Game.Property && !(value instanceof Game.ParametricRuleInstance)) {
			propertiesByName.set(key, value);
			propertyNames.set(value, key);
		}
	}

	// Build talent registry from talent data exports.
	const talents: Record<string, Game.Talent> = {};
	for (const value of Object.values(Game.talentData)) {
		if (
			value &&
			typeof value === 'object' &&
			'id' in value &&
			typeof (value as { id: unknown }).id === 'string'
		) {
			talents[(value as { id: string }).id] = value as Game.Talent;
		}
	}

	return {
		getPropertyKey: (property: Game.Property) => propertyNames.get(property),
		resolveEntity: (id) => Game.entities.get(id),
		resolveProperty: (key) => propertiesByName.get(key),
		resolveTalent: (id) => talents[id],
		resolveStat: (type) => Game.stats[type as Game.StatType] as Game.Stat | undefined,
		resolveEvent: (type) => Game.events[type as Game.EventType] as Game.Event | undefined,
		resolveFocus: (type) => Game.focuses[type as Game.FocusType] as Game.Focus | undefined,
		resolveSlot: (type) => Game.slots[type as Game.SlotType] as Game.Slot | undefined
	};
}

// ---------------------------------------------------------------------------
// Per-entry serialisation
// ---------------------------------------------------------------------------

/**
 * Serialises a single {@link JournalEntry} to a JSON-compatible object
 * suitable for database storage.
 */
export function serialiseJournalEntry(
	entry: JournalEntry,
	context: EngineSerialisationContext
): object {
	return engineSerialisation.decompose(entry, context) as object;
}

/**
 * Deserialises a single {@link JournalEntry} from a JSON-compatible object
 * previously produced by {@link serialiseJournalEntry}.
 */
export function deserialiseJournalEntry(
	json: object,
	context: EngineSerialisationContext
): JournalEntry {
	return engineSerialisation.recompose<JournalEntry>(json as JSONValue, context);
}

// ---------------------------------------------------------------------------
// Split serialisation (data + gamestate columns)
// ---------------------------------------------------------------------------

/**
 * Serialises a {@link JournalEntry} without the game state snapshot,
 * returning a JSON-compatible object for the {@code data} database column.
 *
 * Use together with {@link serialiseGameState} and
 * {@link deserialiseJournalEntryFromParts}.
 */
export function serialiseJournalEntryWithoutGame(
	entry: JournalEntry,
	context: EngineSerialisationContext
): object {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { game: _, ...stateWithoutGame } = entry.state;
	const entryWithoutGame = { ...entry, state: stateWithoutGame };
	return engineSerialisation.decompose(entryWithoutGame, context) as object;
}

/**
 * Serialises only the game state snapshot from a {@link JournalEntry},
 * returning a JSON-compatible object for the {@code gamestate} database column.
 *
 * Use together with {@link serialiseJournalEntryWithoutGame} and
 * {@link deserialiseJournalEntryFromParts}.
 */
export function serialiseGameState(
	game: ReadonlyGameState,
	context: EngineSerialisationContext
): object {
	return engineSerialisation.decompose(game, context) as object;
}

/**
 * Deserialises a {@link JournalEntry} from the split {@code data} and
 * {@code gamestate} columns previously produced by
 * {@link serialiseJournalEntryWithoutGame} and {@link serialiseGameState}.
 *
 * @param data - The serialised entry without its game state.
 * @param gamestate - The serialised game state snapshot (must be non-null).
 */
export function deserialiseJournalEntryFromParts(
	data: object,
	gamestate: object,
	context: EngineSerialisationContext
): JournalEntry {
	const entryWithoutGame = engineSerialisation.recompose<
		Omit<JournalEntry, 'state'> & { state: Omit<ProcedureState, 'game'> }
	>(data as JSONValue, context);

	const game = engineSerialisation.recompose<ReadonlyGameState>(gamestate as JSONValue, context);

	return {
		...entryWithoutGame,
		state: { ...entryWithoutGame.state, game }
	} as JournalEntry;
}
