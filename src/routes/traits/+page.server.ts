import { getLocalisedField, requireLocalisedField, type Locale } from '$lib/localisation';
import { getCatalog, getRecordMetadata } from '../../catalog';
import type { TraitDTO, TraitRecord } from '../../catalog/types/traits';

// TODO: Make this a client supplied parameter
const LOCALE = 'ca';

export const load = async () => {
	const traits = await getTraitDTOs(LOCALE);
	return { title: 'Trets', traits };
};

const getTraitDTOs = async (locale: Locale): Promise<Array<TraitDTO>> => {
	const catalog = await getCatalog<TraitRecord>('traits');
	return catalog.map((record) => traitRecordToDTO(record, locale));
};

const traitRecordToDTO = (record: TraitRecord, locale: Locale): TraitDTO => {
	const metadata = getRecordMetadata(record);
	return {
		...metadata,
		title: requireLocalisedField(record, 'title', locale),
		description: getLocalisedField(record, 'description', locale),
		requirements: record.requirements
	};
};
