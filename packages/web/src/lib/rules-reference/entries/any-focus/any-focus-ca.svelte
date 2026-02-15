<script lang="ts">
	import { attributes } from '@songsofdoom/game';
	import FocusIcon from '$lib/components/focuses/FocusIcon.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Alguns efectes de joc poden requerir o proporcionar un focus <em>qualsevol</em>. Això s'indica
	mitjançant la icona <FocusIcon focus="any" />.
</p>

<p>
	Quan una <RuleLink slug="capability" label="capacitat" /> <strong>requereix</strong> un focus
	<em>qualsevol</em>, es pot utilitzar un focus de qualsevol tipus.
</p>
<p>
	Si una capacitat <strong>proporciona</strong> un focus <em>qualsevol</em>, el jugador pot triar
	guanyar qualsevol tipus de focus associat a un atribut:
</p>
<ul>
	{#each Object.values(attributes) as attribute (attribute.type)}
		<li><Text {...attribute.name} /></li>
	{/each}
</ul>
<p>
	Específicament, en guanyar un focus <em>qualsevol</em>, no es poden triar focus <em>avançats</em>,
	com ara <RuleLink slug="heroism-focus" /> o focus específics proporcionats per arquetips.
</p>
