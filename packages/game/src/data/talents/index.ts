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

export const lightArmour = new Talent({
	id: 'light-armour',
	title: { ca: 'Armadura lleugera', es: 'Armadura ligera', en: 'Light armour' }
});

export const mediumArmour = new Talent({
	id: 'medium-armour',
	title: { ca: 'Armadura mitjana', es: 'Armadura media', en: 'Medium armour' }
});

export const heavyArmour = new Talent({
	id: 'heavy-armour',
	title: { ca: 'Armadura pesada', es: 'Armadura pesada', en: 'Heavy armour' }
});
