import multiline from 'multiline-ts';
import { Obligation } from '../../../../models/capabilities';
import { narrationEvent } from '../../../../models/effects';
import { Story } from '../../../../models/entities/story';

export default new Story({
	title: {
		ca: 'Una audiència amb el duc',
		es: 'Una audiencia con el duque',
		en: 'An audience with the duke'
	},
	capabilities: [
		new Obligation({
			id: 'activate',
			triggers: ['played'],
			effects: [
				narrationEvent({
					text: {
						ca: multiline`
							El duc de Halendak us observa, en silenci, durant uns segons.

							"Acosteu-vos", us diu finalment.
							`
					}
				})
			]
		})
	]
});
