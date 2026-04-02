import { finalise } from '@songsofdoom/common';
import type { GameGraph } from '../game/gamegraph';
import type { TargetId } from '../game/identifiers';
import { Target, type TargetSpec } from '../target';
import { EffectWithOutcome } from './effect';

/**
 * Props for configuring an AttachEffect.
 */
export interface AttachEffectProps {
	/** The card to attach to. Defaults to the current subject. */
	target?: TargetSpec;

	/** Whether multiple copies of the effect can be attached to the same target. */
	stacking?: boolean;
}

export interface AttachOutcome {
	/** The card that received the attachment. */
	readonly targetId: TargetId;
}

/**
 * An effect that attaches the card to a target, conferring its capabilities
 * to that target for the duration.
 */
export class AttachEffect extends EffectWithOutcome<AttachOutcome> {
	/** The card to attach to. */
	readonly target?: Target;

	/** Whether multiple copies of the effect can be attached to the same target. */
	readonly stacking: boolean;

	constructor({ target, stacking = false }: AttachEffectProps) {
		super();
		this.target = finalise(Target, target);
		this.stacking = stacking;
	}

	override async trigger(gameGraph: GameGraph) {
		const targetId = await gameGraph.requestSingleTargetOrActiveCard(this.target);
		gameGraph.effectTriggered<AttachEffect>(this, (state) => {
			const target = state.requireTarget(targetId);
			const attachment = state.requireActiveCard();
			target.addAttachment(state, attachment);
			return { targetId };
		});
	}
}

/** Creates an effect that attaches the card to a target. */
export const attach = (props: AttachEffectProps = {}): AttachEffect => new AttachEffect(props);
