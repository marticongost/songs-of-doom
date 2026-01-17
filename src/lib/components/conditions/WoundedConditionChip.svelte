<script lang="ts">
	import type { WoundedCondition } from '$lib/catalog/models/conditions';
	import Text from '../localisation/Text.svelte';

	export let condition: WoundedCondition;
	void condition;
</script>

<Text ca="ha rebut ferides" es="ha recibido heridas" en="has received wounds" />
