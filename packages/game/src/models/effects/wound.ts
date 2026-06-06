import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../..';
import { isScalarExpression } from '../expressions/scalar/scalar-expression';
import type { Property } from '../properties';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

export interface WoundEffectProps {
	damage: ScalarExpressionType;
	target?: TargetSpec;
	properties?: Array<Property>;
	causedByAttack?: boolean;
}

export class WoundEffect extends Effect {
	readonly damage: ScalarExpressionType;
	readonly target?: Target;
	readonly properties: Array<Property>;
	readonly causedByAttack: boolean;

	constructor({ damage, target, properties, causedByAttack }: WoundEffectProps) {
		super();
		this.damage = damage;
		this.target = finalise(Target, target);
		this.properties = properties ?? [];
		this.causedByAttack = causedByAttack ?? false;
	}

	/*
	override async apply(gameGraph: GameGraph) {
		const targetIds = await gameGraph.requestTargets(this.target, { default: 'current-target' });
		for (const targetId of targetIds) {
			const { damageDealt, negated } = this.computeBaseDamage(gameGraph, targetId);
			gameGraph.mutate((s) => {
				s.woundResolutionStack.push(new MutableWoundResolution({ targetId, damageDealt, negated }));
			});
			await gameGraph.triggerEvent('damageDealt', { subjectId: targetId, targetId });
			await this.applyDamageToTarget(gameGraph, targetId);
		}
	}

	private computeBaseDamage(
		gameGraph: GameGraph,
		targetId: EntityId
	): { damageDealt: number; negated: boolean } {
		if (isLocationId(targetId)) {
			throw new Error('Cannot inflict wounds to a location');
		}
		const state = gameGraph.current.state;
		const target = state.requireEntityState(targetId);

		let rawDamage = state.evaluate(this.damage);
		const effectiveProperties: Array<Property> = [...this.properties];

		if (this.causedByAttack) {
			const attackRes = state.getActiveTestResolution();
			if (attackRes instanceof AttackResolution) {
				if (attackRes.negated) return { damageDealt: 0, negated: true };
				rawDamage += attackRes.damageModifier;
				effectiveProperties.push(...attackRes.properties);
			}
		}

		return {
			damageDealt: this.applyReductions(state, target, rawDamage, effectiveProperties),
			negated: false
		};
	}

	private applyReductions(
		state: ReadonlyGameState,
		target: EntityState<EntityId>,
		rawDamage: number,
		effectiveProperties: Array<Property>
	): number {
		let damage = rawDamage;
		damage = this.applyToughnessReduction(state, target, effectiveProperties, damage);
		damage = this.applyInvulnerableReductions(state, target, effectiveProperties, damage);
		return damage;
	}

	private applyToughnessReduction(
		state: ReadonlyGameState,
		target: EntityState<EntityId>,
		effectiveProperties: Array<Property>,
		rawDamage: number
	): number {
		const toughnessInstance = target.getProperty(toughness);
		const piercingInstance = effectiveProperties.find((p) => p.is(piercing));
		const toughnessValue =
			toughnessInstance instanceof ParametricRuleInstance
				? state.evaluate((toughnessInstance.params as ScalarRuleParams).value)
				: 0;
		const piercingValue =
			piercingInstance instanceof ParametricRuleInstance
				? state.evaluate((piercingInstance.params as ScalarRuleParams).value)
				: 0;
		return Math.max(0, rawDamage - Math.max(0, toughnessValue - piercingValue));
	}

	private applyInvulnerableReductions(
		state: ReadonlyGameState,
		target: EntityState<EntityId>,
		effectiveProperties: Array<Property>,
		damage: number
	): number {
		for (const prop of target.properties) {
			if (prop instanceof ParametricRuleInstance && prop.rule === invulnerable) {
				const { attackType, value } = prop.params as InvulnerableParams;
				if (!attackType || effectiveProperties.some((p) => p === attackType)) {
					damage -= value !== undefined ? state.evaluate(value) : 0;
				}
			}
		}
		return Math.max(0, damage);
	}

	private async applyDamageToTarget(gameGraph: GameGraph, targetId: EntityId) {
		const woundOutcome = gameGraph.mutate((s) => {
			const t = s.requireEntityState(targetId);
			const targetHealth = t.getStat('health')!;
			const resolution = s.requireActiveWoundResolution();
			const finalDamage = resolution.negated
				? 0
				: Math.max(0, resolution.damageDealt + resolution.damageModifier);
			s.woundResolutionStack.pop();
			t.physicalTrauma += finalDamage;
			return { finalDamage, remainingHealth: targetHealth - t.physicalTrauma };
		});
		if (woundOutcome.remainingHealth <= 0) {
			await gameGraph.defeat(targetId);
		}
	}
	*/
}

/** Creates an effect that inflicts a wound. */
export const wound = (damageOrProps: ScalarExpressionType | WoundEffectProps): WoundEffect =>
	new WoundEffect(isScalarExpression(damageOrProps) ? { damage: damageOrProps } : damageOrProps);
