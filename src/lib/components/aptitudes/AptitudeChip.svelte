<script lang="ts">
	import { aptitudes, type Aptitude, type AptitudeType } from '$lib/catalog/models/aptitude';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import AptitudeIcon from './AptitudeIcon.svelte';

	interface Props extends StandardAttributeProps {
		aptitude: Aptitude | AptitudeType;
	}

	const { aptitude, ...attributes }: Props = $props();

	const aptitudeObject = $derived(typeof aptitude === 'string' ? aptitudes[aptitude] : aptitude);
</script>

<span {...standardAttributes(attributes, 'aptitude-chip')} data-aptitude={aptitudeObject.type}>
	<AptitudeIcon aptitude={aptitudeObject} />
	<span class="aptitude-name"><Text {...aptitudeObject.title} /></span>
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.aptitude-chip {
		@include rz.row(xs);
		display: inline-flex;
		align-items: baseline;

		@each $aptitude in strength, agility, intelligence, charisma, will, health, sanity, focus, any {
			&[data-aptitude='#{$aptitude}'] {
				color: var(--aptitude-#{$aptitude}-color);
			}
		}
	}

	.aptitude-name {
		font-weight: bold;
	}
</style>
