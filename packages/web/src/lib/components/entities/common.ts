import { LimitReachedImpediment, type Entity } from '@songsofdoom/game';
import type { EntityManager } from './entitymanager';

export const isLocked = (entity: Entity, entityManager: EntityManager | undefined) => {
	if (!entityManager) return false;
	const impediment = entityManager.getAcquisitionImpediment(entity);
	return impediment && !(impediment instanceof LimitReachedImpediment);
};
