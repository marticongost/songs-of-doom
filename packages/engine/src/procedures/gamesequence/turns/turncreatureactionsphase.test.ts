import { mock } from '@songsofdoom/common/test-utils';
import type { Entity } from '@songsofdoom/game';
import { Action } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import type { ReadonlyCardState } from '../../../state/cardstate';
import type { ReadonlyGameState } from '../../../state/gamestate';
import { chooseEnemyAction } from './turncreatureactionsphase';

const makeAction = (props?: { prioritary: boolean }) =>
	new Action({ id: 'test', prioritary: false, effects: [], ...props });

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

		expect(chooseEnemyAction(state, 'crt1')).toBeUndefined();
	});
	it('returns undefined when no action is feasible', () => {
		const action = makeAction();
		const enemy = makeEnemy([action]);
		const state = mock<ReadonlyGameState>({
			getCapabilityImpediment: () => 'insufficient-charges'
		});
		state.requireCard.mockReturnValue(enemy);

		expect(chooseEnemyAction(state, 'crt1')).toBeUndefined();
	});

	it('returns the first feasible action', () => {
		const action = makeAction();
		const enemyCard = mock<Entity>({ capabilities: [action] });
		const enemyInstance = mock<ReadonlyCardState>({
			id: 'crt1',
			card: enemyCard,
			attachments: []
		});
		const state = mock<ReadonlyGameState>();
		state.requireCard.calledWith('crt1').mockReturnValue(enemyInstance);

		const result = chooseEnemyAction(state, 'crt1');
		expect(result?.cardId).toBe('crt1');
		expect(result?.capabilityId).toBe('test');
	});

	it('prefers a prioritary action over a non-prioritary one', () => {
		const normal = makeAction();
		const prioritary = makeAction({ prioritary: true });
		const enemyCard = mock<Entity>({
			capabilities: [normal, prioritary],
			attachmentCapabilities: []
		});
		const enemyInstance = mock<ReadonlyCardState>({
			id: 'crt1',
			card: enemyCard,
			attachments: []
		});
		const state = mock<ReadonlyGameState>();
		state.requireCard.calledWith('crt1').mockReturnValue(enemyInstance);

		const result = chooseEnemyAction(state, 'crt1');
		expect(result?.cardId).toBe('crt1');
		expect(result?.capabilityId).toBe('test');
	});

	it('returns the first feasible action from a direct attachment', () => {
		const action = makeAction();
		const attachmentEntity = mock<Entity>({ capabilities: [], attachmentCapabilities: [action] });
		const attachment = mock<ReadonlyCardState>({
			id: 'skl1',
			card: attachmentEntity,
			attachments: []
		});
		const enemyCard = mock<Entity>({ capabilities: [], attachmentCapabilities: [] });
		const enemyInstance = mock<ReadonlyCardState>({
			id: 'crt1',
			card: enemyCard,
			attachments: [attachment]
		});
		const state = mock<ReadonlyGameState>();
		state.requireCard.calledWith('crt1').mockReturnValue(enemyInstance);

		const result = chooseEnemyAction(state, 'crt1');
		expect(result?.cardId).toBe('skl1');
		expect(result?.capabilityId).toBe('test');
	});

	it('returns the first feasible action from a deeply nested attachment', () => {
		const action = makeAction();
		const innerAttachmentEntity = mock<Entity>({
			capabilities: [],
			attachmentCapabilities: [action]
		});
		const innerAttachment = mock<ReadonlyCardState>({
			id: 'skl2',
			card: innerAttachmentEntity,
			attachments: []
		});
		const outerAttachmentEntity = mock<Entity>({
			capabilities: [],
			attachmentCapabilities: []
		});
		const outerAttachment = mock<ReadonlyCardState>({
			id: 'skl1',
			card: outerAttachmentEntity,
			attachments: [innerAttachment]
		});
		const enemyCard = mock<Entity>({ capabilities: [], attachmentCapabilities: [] });
		const enemyInstance = mock<ReadonlyCardState>({
			id: 'crt1',
			card: enemyCard,
			attachments: [outerAttachment]
		});
		const state = mock<ReadonlyGameState>();
		state.requireCard.calledWith('crt1').mockReturnValue(enemyInstance);

		const result = chooseEnemyAction(state, 'crt1');
		expect(result?.cardId).toBe('skl2');
		expect(result?.capabilityId).toBe('test');
	});

	it('prefers a prioritary action from an attachment over a non-prioritary one from the card', () => {
		const normal = makeAction();
		const prioritary = makeAction({ prioritary: true });
		const attachmentCard = mock<Entity>({
			capabilities: [],
			attachmentCapabilities: [prioritary]
		});
		const attachmentInstance = mock<ReadonlyCardState>({
			id: 'skl1',
			card: attachmentCard,
			attachments: []
		});
		const enemyCard = mock<Entity>({
			capabilities: [normal],
			attachmentCapabilities: []
		});
		const enemyInstance = mock<ReadonlyCardState>({
			id: 'crt1',
			card: enemyCard,
			attachments: [attachmentInstance]
		});
		const state = mock<ReadonlyGameState>();
		state.requireCard.calledWith('crt1').mockReturnValue(enemyInstance);

		const result = chooseEnemyAction(state, 'crt1');
		expect(result?.cardId).toBe('skl1');
		expect(result?.capabilityId).toBe('test');
	});
});
