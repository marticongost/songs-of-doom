import { finalise } from '@songsofdoom/common';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring an AttachEffect.
 */
export interface AttachEffectProps {
	/** The card to attach to. Defaults to the current subject. */
	target?: TargetSpec;

	/** Whether multiple copies of the effect can be attached to the same target. */
	stacking?: boolean;
}

/**
 * An effect that attaches the card to a target, conferring its capabilities
 * to that target for the duration.
 */
export class AttachEffect extends Effect {
	/** The card to attach to. */
	readonly target?: Target;

	/** Whether multiple copies of the effect can be attached to the same target. */
	readonly stacking: boolean;

	constructor({ target, stacking = false }: AttachEffectProps) {
		super();
		this.target = finalise(Target, target);
		this.stacking = stacking;
	}

	/*
	override async apply(gameGraph: GameGraph) {
		const targetId = await gameGraph.requestSingleTarget(this.target, {
			default: 'active-card'
		});
		await gameGraph.mutate((state) => {
			const target = state.requireCard(targetId as CardId);
			const attachment = state.requireActiveCard();
			target.addAttachment(state, attachment);
			return { targetId };
		});
	}
	*/
}

/** Creates an effect that attaches the card to a target. */
export const attach = (props: AttachEffectProps = {}): AttachEffect => new AttachEffect(props);
