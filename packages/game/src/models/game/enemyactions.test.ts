import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import { Action } from '../capabilities/action';
import { chooseEnemyAction } from './enemyactions';

// ─── chooseEnemyAction ────────────────────────────────────────────────────────

import type { Entity } from '../entities';
import type { ReadonlyCardState } from './cardstate';
import type { ReadonlyGameState } from './gamestate';
import type { CardId } from './identifiers';

describe('chooseEnemyAction', () => {
	function makeEnemy(capabilities: Action[]): ReadonlyCardState {
		const entity = mock<Entity>({
			capabilities,
			attachmentCapabilities: []
		});
		return mock<ReadonlyCardState>({ card: entity, attachments: [] });
	}

	it('returns undefined when the enemy has no action capabilities', () => {
		const enemy = makeEnemy([]);
		const state = mock<ReadonlyGameState>();
		state.requireCard.mockReturnValue(enemy);

		expect(chooseEnemyAction(state, 'crt1' as CardId)).toBeUndefined();
	});
	it('returns undefined when no action is feasible', () => {
		const action = mock<Action>({ isFeasible: () => false });
		const enemy = makeEnemy([action]);
		const state = mock<ReadonlyGameState>();
		state.requireCard.mockReturnValue(enemy);

		expect(chooseEnemyAction(state, 'crt1' as CardId)).toBeUndefined();
	});

	it('returns the first feasible action with its initiative and cardId', () => {
		const action = new Action({ effects: [] });
		const entity = mock<Entity>({ capabilities: [action], attachmentCapabilities: [] });
		const enemy = mock<ReadonlyCardState>({
			card: entity,
			attachments: [],
			getStat: () => 2
		});
		const state = mock<ReadonlyGameState>();
		state.requireCard.mockReturnValue(enemy);
		state.calculateInitiative.mockReturnValue(2);

		const result = chooseEnemyAction(state, 'crt1' as CardId);
		expect(result?.cardId).toBe('crt1');
		expect(result?.action).toBe(action);
		expect(result?.initiative).toBe(2);
	});

	it('prefers a prioritary action over a non-prioritary one', () => {
		const normal = new Action({ effects: [] });
		const prioritary = new Action({ prioritary: true, effects: [] });
		const entity = mock<Entity>({ capabilities: [normal, prioritary], attachmentCapabilities: [] });
		const enemy = mock<ReadonlyCardState>({
			card: entity,
			attachments: [],
			getStat: () => 1
		});
		const state = mock<ReadonlyGameState>();
		state.requireCard.mockReturnValue(enemy);

		const result = chooseEnemyAction(state, 'crt1' as CardId);
		expect(result?.cardId).toBe('crt1');
		expect(result?.action).toBe(prioritary);
	});

	it('uses the attachment cardId for actions from attachments', () => {
		const action = new Action({ effects: [] });
		const attachmentEntity = mock<Entity>({ capabilities: [], attachmentCapabilities: [action] });
		const attachment = mock<ReadonlyCardState>({
			id: 'skl1',
			card: attachmentEntity,
			attachments: []
		});
		const entity = mock<Entity>({ capabilities: [], attachmentCapabilities: [] });
		const enemy = mock<ReadonlyCardState>({
			card: entity,
			attachments: [attachment],
			getStat: () => 3
		});
		const state = mock<ReadonlyGameState>();
		state.requireCard.mockReturnValue(enemy);

		const result = chooseEnemyAction(state, 'crt1' as CardId);
		expect(result?.cardId).toBe('skl1');
		expect(result?.action).toBe(action);
	});
});
