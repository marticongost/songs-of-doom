import type { MutableEntityState } from '../game/entitystate';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import type { EntityId } from '../game/identifiers';
import type { Property } from '../properties';
import { Effect } from './effect';

/**
 * Props for configuring a ConferPropertiesEffect.
 */
export interface ConferPropertiesEffectProps {
	/**
	 * The properties that are granted while the effect lasts.
	 */
	properties: Array<Property>;
}

/**
 * An effect that applies one or more properties while active. This allows cards to gain
 * Keywords or increase the value of already possessed scalar rules (e.g., increasing
 * Piercing (2) to Piercing (3)) for the duration.
 */
export class ConferPropertiesEffect extends Effect {
	/**
	 * The properties that are granted while the effect lasts.
	 */
	readonly properties: Array<Property>;

	constructor({ properties }: ConferPropertiesEffectProps) {
		super();
		this.properties = properties;
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<ConferPropertiesEffect>(this, (state: MutableGameState) => {
			const target = state.requireImplicitTarget();
			for (const conferedProperty of this.properties) {
				this.addProperty(conferedProperty, target);
			}
		});
	}

	private addProperty(property: Property, target: MutableEntityState<EntityId>): void {
		const existingProperty = target.getProperty(property);
		if (!existingProperty) {
			target.properties.push(property);
		} else {
			const position = target.properties.indexOf(existingProperty);
			target.properties[position] = existingProperty.merge(property);
		}
	}
}

/** Creates a confer properties effect. */
export const conferProperties = (
	propertiesOrProps: Array<Property> | ConferPropertiesEffectProps
): ConferPropertiesEffect =>
	new ConferPropertiesEffect(
		Array.isArray(propertiesOrProps) ? { properties: propertiesOrProps } : propertiesOrProps
	);
