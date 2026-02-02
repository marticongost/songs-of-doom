<script module lang="ts">
	export const metadata = { title: 'Focus' };
</script>

<script lang="ts">
	import { attributes, Stat } from '$lib/catalog/models/stats';
	import Text from '$lib/components/localisation/Text.svelte';
	import TextList from '$lib/components/localisation/TextList.svelte';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Les fitxes de focus són el recurs fonamental utilitzat pels jugadors per activar les seves <RuleLink
		slug="capability"
		label="capacitats"
	/> durant el joc. La majoria de capacitats tenen un cost d'una o més fitxes de focus, que els jugadors
	hauran de pagar quan vulguin activar-les.
</p>
<p>
	Al principi del capítol, cada jugador roba 5 fitxes de la seva <em>bossa de focus</em>. Durant la
	resta del capítol, el jugador utilitzarà aquestes fitxes per activar les seves capacitats. Algunes
	capacitats poden permetre als jugadors guanyar fitxes de focus addicionals durant el capítol.
</p>
<p>
	Les fitxes de focus tenen un <em>tipus</em> i un <em>valor</em>:
</p>
<ul>
	<li>
		El <strong>valor</strong> és un número que oscil·la entre 1 i 3, i indica la quantitat de focus que
		proporciona la fitxa quan s'utilitza. Les capacitats més poderoses tindran costs més elevats, de manera
		que fitxes amb valors més elevats seran més útils.
	</li>
	<li>
		El <strong>tipus</strong> del focus es divideix en dues categories:
		<ul>
			<li>
				<em>Focus d'atribut</em>: Estan associats a un <RuleLink slug="attribute" label="atribut" /> específic
				(<TextList items={Object.values(attributes)} type="or"
					>{#snippet entry(item: Stat)}<Text {...item.name} />{/snippet}</TextList
				>). Els jugadors guanyen noves fitxes d'aquests tipus a mida que milloren els seus atributs.
			</li>
			<li>
				<em>Focus avançats</em>: Inclouen tipus com l'<RuleLink slug="heroism-focus" />
				(un comodí que pot substituir qualsevol focus d'atribut), així com d'altres tipus més especialitzats
				vinculats a <RuleLink slug="archetype" label="arquetips" />
				específics.
			</li>
		</ul>
	</li>
</ul>
<p>
	En pagar una capacitat, el jugador ha de pagar focus suficient com per cobrir-ne el cost total.
	Això pot implicar combinar múltiples fitxes de focus de diferents tipus i valors.
</p>
