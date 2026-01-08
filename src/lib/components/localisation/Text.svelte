<script lang="ts">
	import { getLocale } from '$lib/context/locale';

	export let ca: string = '';
	export let es: string = '';
	export let en: string = '';

	const locale = getLocale();
</script>

{#if locale === 'ca'}
	{ca}
{:else if locale === 'es'}
	{es}
{:else}
	{en}
{/if}
