<!--
	@component Displays a player's status overlay with circular portrait, character name,
	trauma rings (concentric circular segments), and resource indicators.

	Trauma is rendered as concentric circular segments around the portrait:
	- *Outer ring* (red) shows physical trauma — one segment per point of max health.
	- *Inner ring* (blue) shows mental trauma — one segment per point of max sanity.
	Each unfilled segment is a dim outline; filled segments light up in the trauma colour.

	@prop player - The player state to display.
	@prop characterName - The character's display name.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const PHYSICAL_COLOR = css.palette.red;
	const MENTAL_COLOR = css.palette.blue;
	const RING_BG_COLOR = css.palette.ash;

	/** Proportion of the full circle that segments occupy. */
	const SEGMENT_COVERAGE = 6 / 7;
	/** Fixed angular gap between adjacent segments (radians). */
	const SEGMENT_GAP_ANGLE = 0.1;
	/** Outer ring radius (physical trauma), in SVG viewBox units. */
	const OUTER_RING_R = 68;
	/** Inner ring radius (mental trauma), in SVG viewBox units. */
	const INNER_RING_R = 56;
	/** SVG viewBox half-size — must be larger than OUTER_RING_R. */
	const VIEWBOX_HALF = 72;

	const styles = css.styles({
		overlay: {
			...css.row('md')
		},
		portraitWrapper: {
			position: 'relative',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: '7.5em',
			height: '7.5em'
		},
		traumaSvg: {
			position: 'absolute',
			inset: '0',
			width: '100%',
			height: '100%',
			pointerEvents: 'none'
		},
		name: {
			fontFamily: css.fonts.heading,
			color: css.text.headingColor,
			fontSize: '0.9em',
			textAlign: 'center',
			maxWidth: '10em',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		},
		details: {
			...css.column('sm')
		},
		indicators: {
			...css.row('sm')
		}
	});

	/**
	 * Generates SVG arc path `d` strings for `total` equally-spaced circular
	 * segments of the given radius, centred at (0, 0).
	 *
	 * Segments are clustered within {@link SEGMENT_COVERAGE} of the full
	 * circle, leaving the remaining portion as a single visible gap.
	 * Adjacent segments are separated by a fixed gap ({@link SEGMENT_GAP_ANGLE}).
	 */
	function segmentArcs(r: number, total: number): string[] {
		if (total <= 0) return [];
		const totalArc = 2 * Math.PI * SEGMENT_COVERAGE;
		const gapAngle = Math.min(SEGMENT_GAP_ANGLE, totalArc / (total * 2));
		const filledTotal = totalArc - total * gapAngle;
		const filledAngle = filledTotal / total;

		const arcs: string[] = [];
		for (let i = 0; i < total; i++) {
			const start = i * (filledAngle + gapAngle);
			const end = start + filledAngle;
			arcs.push(describeArc(0, 0, r, start, end));
		}
		return arcs;
	}

	/**
	 * Returns an SVG arc path `d` string from `startAngle` to `endAngle`
	 * on a circle of radius `r`, centred at (`cx`, `cy`).
	 */
	function describeArc(
		cx: number,
		cy: number,
		r: number,
		startAngle: number,
		endAngle: number
	): string {
		const x1 = cx + r * Math.cos(startAngle);
		const y1 = cy + r * Math.sin(startAngle);
		const x2 = cx + r * Math.cos(endAngle);
		const y2 = cy + r * Math.sin(endAngle);
		const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
		return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
	}
</script>

<script lang="ts">
	import Portrait from '$lib/components/characters/Portrait.svelte';
	import CardCopiesIndicator from '$lib/components/indicators/CardCopiesIndicator.svelte';
	import CluesIndicator from '$lib/components/indicators/CluesIndicator.svelte';
	import GoldIndicator from '$lib/components/indicators/GoldIndicator.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { PlayerState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		player: PlayerState;
		characterName: string;
	}

	const { player, characterName, ...attributes }: Props = $props();

	const handCount = $derived(player.hand.length);
	const clues = $derived(player.clues);
	const gold = $derived(player.gold);
	const physicalTrauma = $derived(player.physicalTrauma);
	const mentalTrauma = $derived(player.mentalTrauma);
	const portrait = $derived(player.character.portrait);
	const maxHealth = $derived(player.getStat('health'));
	const maxSanity = $derived(player.getStat('sanity'));
	const healthArcs = $derived(segmentArcs(OUTER_RING_R, maxHealth));
	const sanityArcs = $derived(segmentArcs(INNER_RING_R, maxSanity));
</script>

<div {...standardAttributes(attributes, styles.overlay)}>
	<div class={styles.portraitWrapper}>
		<Portrait {portrait} circular />

		<!-- Concentric trauma rings — rendered outside the portrait -->
		<svg
			class={styles.traumaSvg}
			viewBox={`${-VIEWBOX_HALF} ${-VIEWBOX_HALF} ${VIEWBOX_HALF * 2} ${VIEWBOX_HALF * 2}`}
			aria-label="Trauma indicators"
			role="img"
		>
			<!-- Physical trauma ring (outer) — one segment per health point -->
			<g>
				{#each healthArcs as arc, i (i)}
					<path
						d={arc}
						fill="none"
						stroke={i < physicalTrauma ? PHYSICAL_COLOR : RING_BG_COLOR}
						stroke-width="8"
						stroke-linecap="butt"
						opacity={i < physicalTrauma ? 1 : 0.3}
					/>
				{/each}
			</g>

			<!-- Mental trauma ring (inner) — one segment per sanity point -->
			<g>
				{#each sanityArcs as arc, i (i)}
					<path
						d={arc}
						fill="none"
						stroke={i < mentalTrauma ? MENTAL_COLOR : RING_BG_COLOR}
						stroke-width="8"
						stroke-linecap="butt"
						opacity={i < mentalTrauma ? 1 : 0.3}
					/>
				{/each}
			</g>
		</svg>
	</div>

	<div class={styles.details}>
		<div class={styles.name}>{characterName}</div>
		<div class={styles.indicators}>
			<CardCopiesIndicator amount={handCount} />
			<CluesIndicator amount={clues} />
			<GoldIndicator amount={gold} />
		</div>
	</div>
</div>
