import multiline from 'multiline-ts';
import { Obligation } from '../../../../models/capabilities';
import { narration, placeLocation, setLocation } from '../../../../models/effects';
import { Story } from '../../../../models/entities/story';
import { reactiveCardIsSubject } from '../../../../models/expressions';

export default new Story({
	title: {
		ca: 'Una audiència amb el duc',
		es: 'Una audiencia con el duque',
		en: 'An audience with the duke'
	},
	capabilities: [
		new Obligation({
			id: 'activate',
			triggers: [{ event: 'storyPlayed', condition: reactiveCardIsSubject }],
			effects: [
				narration({
					text: {
						ca: multiline`
							El duc de Halendak us observa, en silenci, durant uns segons.

							"Acosteu-vos", us diu finalment.
							`
					}
				}),
				placeLocation({
					id: 'SoHH-sc1-battleground',
					coordinates: { x: 0, y: 0 },
					connections: []
				}),
				placeLocation({
					id: 'SoHH-sc1-somber-forest',
					coordinates: { x: -1, y: 0.5 },
					connections: ['SoHH-sc1-battleground']
				}),
				placeLocation({
					id: 'SoHH-sc1-field-hospital',
					coordinates: { x: -1, y: -0.5 },
					connections: ['SoHH-sc1-battleground', 'SoHH-sc1-somber-forest']
				}),
				placeLocation({
					id: 'SoHH-sc1-reddened-ford',
					coordinates: { x: 1, y: -0.5 },
					connections: ['SoHH-sc1-battleground']
				}),
				placeLocation({
					id: 'SoHH-sc1-old-mill',
					coordinates: { x: 1, y: 0.5 },
					connections: ['SoHH-sc1-battleground', 'SoHH-sc1-reddened-ford']
				}),
				setLocation({
					target: { type: 'player', cardinality: 'every' },
					destination: { cardIds: ['SoHH-sc1-battleground'] }
				})
			]
		})
	]
});
