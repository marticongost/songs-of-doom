import type { Trait, TraitDTO } from '../../catalog/types/traits';

type Traits = Record<string, Trait>;

interface ServerPageData {
	traits: Array<TraitDTO>;
}

export const load = async ({ data }: { data: ServerPageData }) => {
	return { ...data, traits: processTraitDTOs(data.traits) };
};

const processTraitDTOs = (traitDTOs: Array<TraitDTO>): Traits => {
	const traits: Traits = {};
	const dtoMap: Record<string, TraitDTO> = {};
	traitDTOs.forEach((dto) => (dtoMap[dto.id] = dto));

	const processTrait = (id: string, referrers: Set<string>): Trait => {
		const dto = dtoMap[id];
		console.log(id, dto);

		// Cache already processed traits
		let trait = traits[id];
		if (trait) {
			return trait;
		}

		// Prevent cyclic dependencies
		if (referrers && referrers.has(id)) {
			throw new Error(`Cyclic dependency detected for trait ID: ${id}`);
		}

		trait = {
			id,
			title: dto.title,
			description: dto.description,
			requirements:
				dto.requirements?.map((requirement) => {
					if ('trait' in requirement) {
						return { trait: processTrait(requirement.trait, new Set([...referrers, id])) };
					} else {
						return {
							traitProperty: { id: requirement.traitProperty, title: requirement.traitProperty },
							count: requirement.count
						};
					}
				}) ?? []
		};
		traits[id] = trait;
		return trait;
	};

	traitDTOs.forEach((dto) => processTrait(dto.id, new Set()));
	return traits;
};
