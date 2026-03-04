import { intelligence } from '../../models/stats';
import { Talent } from '../../models/talent';

export const disarmTrap = new Talent({
	id: 'disarm-trap',
	title: { ca: 'Desactivar trampes', es: 'Desactivar trampas', en: 'Disarm traps' },
	stat: intelligence
});

export const lockpicking = new Talent({
	id: 'lockpicking',
	title: { ca: 'Forçar panys', es: 'Forzar cerraduras', en: 'Lockpicking' },
	stat: intelligence
});
