import type { GameGraph } from '../game/gamegraph';
import type { Property } from '../properties';
import { Effect } from './effect';

/**
 * Props for configuring a ReplacePropertyEffect.
 */
export interface ReplacePropertyEffectProps {
	/**
	 * The property to be replaced.
	 */
	original: Property;

	/**
	 * The property that replaces the original.
	 */
	replacement: Property;
}

/**
 * An effect that replaces one property with another. This allows cards to swap
 * out an existing Keyword or Rule for a different one.
 */
export class ReplacePropertyEffect extends Effect {
	override readonly defaultEvent = 'beforeDrawingFate';

	/**
	 * The property to be replaced.
	 */
	readonly original: Property;

	/**
	 * The property that replaces the original.
	 */
	readonly replacement: Property;

	constructor({ original, replacement }: ReplacePropertyEffectProps) {
		super();
		this.original = original;
		this.replacement = replacement;
	}

	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

/** Creates a replace property effect. */
export const replaceProperty = (props: ReplacePropertyEffectProps): ReplacePropertyEffect =>
	new ReplacePropertyEffect(props);
