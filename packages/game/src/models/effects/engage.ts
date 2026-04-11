import { finalise } from '@songsofdoom/common';
import type { MutableCardState } from '../game/cardstate';
import type { EntityState, MutableEntityState } from '../game/entitystate';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import type { CardId, PlayerId } from '../game/identifiers';
import { type ActorTargetType, Target, type TargetSpec } from '../target';
import { Effect } from './effect';

export interface EngageEffectProps {
	/** The subject(s) performing the engage action. */
	subject?: TargetSpec<ActorTargetType>;

	/** The target(s) to engage. */
	target: TargetSpec<ActorTargetType>;
}

/**
 * An effect that allows the player to engage an opponent, pulling them
 * into melee range within the player's threat zone.
 */
export class EngageEffect extends Effect {
	/** The subject(s) performing the engage action. */
	readonly subject?: Target<ActorTargetType>;

	/** The target(s) to engage. */
	readonly target: Target<ActorTargetType>;

	constructor({ subject, target }: EngageEffectProps) {
		super();
		this.subject = finalise(Target, subject);
		this.target = finalise(Target, target);
	}

	override async trigger(gameGraph: GameGraph) {
		const subjectIds = await gameGraph.requestSubjects(this.subject);
		const targetIds = (await gameGraph.requestInput(this.target)).target;

		if (subjectIds.length > 1 && targetIds.length > 1) {
			throw new Error('Enemies can only be engaged to a single opponent');
		} else if (subjectIds.length === 0) {
			throw new Error('At least one subject must be chosen to engage');
		} else if (targetIds.length === 0) {
			throw new Error('At least one target must be chosen to engage');
		}

		gameGraph.effectTriggered<EngageEffect>(this, (state: MutableGameState) => {
			const subjects = subjectIds.map((id) => state.requireEntityState(id));
			const targets = targetIds.map((id) => state.requireEntityState(id));

			type CardLike = EntityState<CardId | PlayerId> & {
				card: { type: { id: string } };
			};
			const isCardLike = (s: EntityState<CardId | PlayerId>): s is CardLike => 'card' in s;

			const isPlayerOrAlly = (entityState: EntityState<CardId | PlayerId>): boolean =>
				!isCardLike(entityState) || entityState.card.type.id === 'ally';

			const isCreature = (entityState: EntityState<CardId | PlayerId>): boolean =>
				isCardLike(entityState) && entityState.card.type.id === 'creature';

			let friendly: MutableEntityState<CardId | PlayerId>;
			let enemiesList: Array<MutableCardState>;

			if (isPlayerOrAlly(subjects[0])) {
				if (subjects.length > 1) {
					throw new Error('Only one friendly target can be chosen to engage');
				}
				if (targets.some((t) => !isCreature(t))) {
					throw new Error('Invalid subject/target combination');
				}
				friendly = subjects[0];
				enemiesList = targets as Array<MutableCardState>;
			} else if (isPlayerOrAlly(targets[0])) {
				if (targets.length > 1) {
					throw new Error('Only one friendly target can be chosen to engage');
				}
				if (subjects.some((s) => !isCreature(s))) {
					throw new Error('Invalid subject/target combination');
				}
				friendly = targets[0];
				enemiesList = subjects as Array<MutableCardState>;
			} else {
				throw new Error('Invalid subject/target combination');
			}

			for (const enemy of enemiesList) {
				friendly.addAttachment(state, enemy);
			}
		});
	}
}

/**
 * Creates an effect that engages an opponent.
 */
export const engage = (props: EngageEffectProps): EngageEffect => new EngageEffect(props);
