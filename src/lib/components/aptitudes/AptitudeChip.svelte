<script lang="ts">
	import { aptitudes, type Aptitude, type AptitudeType } from '$lib/catalog/models/aptitude';
	import { standardAttributes } from '$lib/components/standardattributes';
	import Text from '$lib/components/localisation/Text.svelte';
	import AptitudeIcon from './AptitudeIcon.svelte';

	export let aptitude: Aptitude | AptitudeType;
	const aptitudeObject = typeof aptitude === 'string' ? aptitudes[aptitude] : aptitude;
</script>

<span {...standardAttributes($$props, 'aptitude-chip')} data-aptitude={aptitudeObject.type}>
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
