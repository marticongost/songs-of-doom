import { isAlly, isCreature, type EngageEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { MutableCardState } from '../../state/cardstate';
import type { EntityState, MutableEntityState } from '../../state/entitystate';
import { isCardId, type EntityId } from '../../state/identifiers';
import type { EffectProcedureState } from '../core/triggereffect';

export interface EngageEffectState extends EffectProcedureState<EngageEffect> {
	/** The resolved target IDs from the target resolution step. */
	targetIds: EntityId[];
}

const { define, resolveTargetList, mutateGameState } = instructions<EngageEffectState>();

export const engageEffectProc = define({
	id: ProcedureId.EngageEffect,
	steps: {
		resolveTargets: resolveTargetList(({ effect }) => effect.target, 'targetIds'),
		engage: mutateGameState((state, game) => {
			const { targetIds } = state;
			if (targetIds.length === 0) {
				throw new Error('At least one target must be chosen to engage');
			}

			const subject = game.requireSubject() as MutableEntityState<EntityId>;
			const targets = targetIds.map((id) =>
				game.requireEntityState(id)
			) as MutableEntityState<EntityId>[];

			/** Checks whether an entity state is a card (has a `.card` property). */
			const isCardLike = (entity: EntityState<EntityId>): entity is MutableCardState =>
				isCardId(entity.id);

			/** Player (no card) or an ally card. */
			const isPlayerOrAlly = (entity: EntityState<EntityId>): boolean =>
				!isCardLike(entity) || isAlly(entity.card);

			/** Creature card (hostile). */
			const isEntityCreature = (entity: EntityState<EntityId>): boolean =>
				isCardLike(entity) && isCreature(entity.card);

			let friendly: MutableEntityState<EntityId>;
			let enemiesList: Array<MutableCardState>;

			if (isPlayerOrAlly(subject)) {
				if (targets.some((t) => !isEntityCreature(t))) {
					throw new Error('Invalid subject/target combination');
				}
				friendly = subject;
				enemiesList = targets as MutableCardState[];
			} else if (isEntityCreature(subject)) {
				if (targets.length > 1) {
					throw new Error('Enemies can only be engaged to a single opponent');
				}
				if (!isPlayerOrAlly(targets[0])) {
					throw new Error('Invalid subject/target combination');
				}
				friendly = targets[0];
				enemiesList = [subject as MutableCardState];
			} else {
				throw new Error('Invalid subject/target combination');
			}

			for (const enemy of enemiesList) {
				friendly.addAttachment(game, enemy);
			}
		})
	}
});
