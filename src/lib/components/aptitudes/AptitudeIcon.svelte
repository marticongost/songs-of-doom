<script lang="ts">
	import { aptitudes, type Aptitude, type AptitudeType } from '$lib/catalog/models/aptitude';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import { standardAttributes } from '$lib/components/standardattributes';

	export let aptitude: Aptitude | AptitudeType;
	const aptitudeObject = typeof aptitude === 'string' ? aptitudes[aptitude] : aptitude;
</script>

<InlineSvg
	{...standardAttributes($$props, 'aptitude-icon')}
	data-aptitude={aptitudeObject.type}
	src="aptitudes/{aptitudeObject.type}.svg"
/>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.aptitude-icon) {
		align-self: center;
		border-radius: 0.2em;
		padding: 0.05em;
		width: 1.2em;
		height: 1.2em;
		filter: drop-shadow(0 0 0.8rem black);
	}

	@each $aptitude in strength, agility, intelligence, charisma, will, health, sanity, focus, any {
		:global(.aptitude-icon[data-aptitude='#{$aptitude}']) {
			background-color: white;
			color: var(--aptitude-#{$aptitude}-color);
			border: 1px solid var(--aptitude-#{$aptitude}-color);
		}
	}
</style>
