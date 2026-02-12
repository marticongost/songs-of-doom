import { receivedWounds } from '../scalar/wounds';
import { gte } from './comparison';

export const wounded = gte(receivedWounds, 1);
