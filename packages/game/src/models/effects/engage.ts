import { finalise } from '@songsofdoom/common';
import type { MutableCardState } from '../game/cardstate';
import type { EntityState, MutableEntityState } from '../game/entitystate';
import type { GameGraph } from '../game/gamegraph';
import { isCardId, type EntityId } from '../game/identifiers';
import { Target, type ActorTargetType, type TargetSpec } from '../target';
import { Effect } from './effect';

export interface EngageEffectProps {
	/** The target(s) to engage. */
	target: TargetSpec<ActorTargetType>;
}

/**
 * An effect that allows the player to engage an opponent, pulling them
 * into melee range within the player's threat zone.
 */
export class EngageEffect extends Effect {
	/** The target(s) to engage. */
	readonly target: Target<ActorTargetType>;

	constructor({ target }: EngageEffectProps) {
		super();
		this.target = finalise(Target, target);
	}

	override async apply(gameGraph: GameGraph) {
		const subjectId = gameGraph.requireSubject().id;
		const targetIds = (await gameGraph.requestInput(this.target)).target;

		if (targetIds.length === 0) {
			throw new Error('At least one target must be chosen to engage');
		}

		gameGraph.mutate((state) => {
			const subject = state.requireEntityState(subjectId);
			const targets = targetIds.map((id) => state.requireEntityState(id));

			type CardLike = EntityState<EntityId> & {
				card: { type: { id: string } };
			};
			const isCardLike = (s: EntityState<EntityId>): s is CardLike => isCardId(s.id);

			const isPlayerOrAlly = (entityState: EntityState<EntityId>): boolean =>
				!isCardLike(entityState) || entityState.card.type.id === 'ally';

			const isCreature = (entityState: EntityState<EntityId>): boolean =>
				isCardLike(entityState) && entityState.card.type.id === 'creature';

			let friendly: MutableEntityState<EntityId>;
			let enemiesList: Array<MutableCardState>;

			if (isPlayerOrAlly(subject)) {
				if (targets.some((t) => !isCreature(t))) {
					throw new Error('Invalid subject/target combination');
				}
				friendly = subject as MutableEntityState<EntityId>;
				enemiesList = targets as Array<MutableCardState>;
			} else if (isCreature(subject)) {
				if (targets.length > 1) {
					throw new Error('Enemies can only be engaged to a single opponent');
				}
				if (!isPlayerOrAlly(targets[0])) {
					throw new Error('Invalid subject/target combination');
				}
				friendly = targets[0] as MutableEntityState<EntityId>;
				enemiesList = [subject as MutableCardState];
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
