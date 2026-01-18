<script lang="ts">
	import type { WoundedCondition } from '$lib/catalog/models/conditions';
	import Text from '../localisation/Text.svelte';

	interface Props {
		condition: WoundedCondition;
	}

	const { condition }: Props = $props();
	void condition;
</script>

<Text ca="ha rebut ferides" es="ha recibido heridas" en="has received wounds" />
