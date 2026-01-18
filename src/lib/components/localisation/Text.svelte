<script lang="ts">
	import { getLocale } from '$lib/context/locale';

	interface Props {
		ca?: string;
		es?: string;
		en?: string;
	}

	const { ca = '', es = '', en = '' }: Props = $props();

	const locale = getLocale();
</script>

{#if locale === 'ca'}
	{ca}
{:else if locale === 'es'}
	{es}
{:else}
	{en}
{/if}
