<!--
	@component Renders the game map as a grid of locations.

	Computes the bounding box from all location coordinates and positions each
	{@link GameMapLocation} absolutely within the map container. Coordinates
	support .5 increments for fine-grained placement.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	/** Distance between adjacent grid cell centers (in em). */
	const CELL_SIZE = 16;

	/** Width and height of each location node (in em). Must be square for consistent gaps. */
	const NODE_SIZE = 14;

	const styles = css.styles({
		container: {
			flex: '1 1 auto',
			overflow: 'auto',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			background: css.palette.cocoaBrown
		},
		map: {
			'--node-size': `${NODE_SIZE}em`,
			position: 'relative',
			flexShrink: 0
		}
	});
</script>

<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { LocationState } from '@songsofdoom/engine';
	import GameMapLocation from './GameMapLocation.svelte';

	interface Props extends StandardAttributeProps {
		locations: ReadonlyArray<LocationState>;
	}

	const { locations, ...attributes }: Props = $props();

	/**
	 * Compute the bounding box of all location coordinates.
	 * Returns null if there are no locations.
	 */
	const bounds = $derived.by(() => {
		if (locations.length === 0) return null;

		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;

		for (const loc of locations) {
			const { x, y } = loc.coordinates;
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			if (y > maxY) maxY = y;
		}

		return { minX, maxX, minY, maxY };
	});

	/** Map dimensions in em, based on the coordinate bounding box plus node size. */
	const mapWidth = $derived(bounds ? (bounds.maxX - bounds.minX) * CELL_SIZE + NODE_SIZE : 0);
	const mapHeight = $derived(bounds ? (bounds.maxY - bounds.minY) * CELL_SIZE + NODE_SIZE : 0);

	/** Compute the CSS left/top position for a location. */
	function positionStyle(x: number, y: number): string {
		if (!bounds) return '';
		const left = (x - bounds.minX) * CELL_SIZE;
		const top = (y - bounds.minY) * CELL_SIZE;
		return `left: ${left}em; top: ${top}em;`;
	}
</script>

<div {...standardAttributes(attributes, styles.container)}>
	{#if bounds && locations.length > 0}
		<div class={styles.map} style="width: {mapWidth}em; height: {mapHeight}em;">
			{#each locations as location (location.id)}
				<GameMapLocation
					{location}
					style={positionStyle(location.coordinates.x, location.coordinates.y)}
				/>
			{/each}
		</div>
	{/if}
</div>
