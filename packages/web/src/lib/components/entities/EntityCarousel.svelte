<!--
@component
A carousel viewer for entities using a dialog overlay.
Shows the current entity with arc-positioned sibling cards and navigation controls.

@example
```svelte
<script>
  let carouselRef: EntityCarousel;
</script>

<EntityCarousel bind:this={carouselRef} {entities} />
<button onclick={() => carouselRef.open(0)}>Open carousel</button>
```
-->
<script lang="ts" module>
	export interface EntityCarouselApi {
		open: (index?: number) => void;
		close: () => void;
	}
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import { getLocale } from '$lib/context/locale';
	import type { Entity } from '@songsofdoom/game';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import Button from '../Button.svelte';
	import Card from '../Card.svelte';
	import Text from '../localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		/** All entities available for viewing */
		entities: Entity[];
		/** Number of sibling cards to show on each side (default: 2) */
		siblingCount?: number;
		/** Additional action buttons, receives current entity */
		actions?: Snippet<[Entity]>;
		/** Callback when carousel is closed */
		onclose?: () => void;
	}

	const { entities, siblingCount = 2, actions, onclose, ...attributes }: Props = $props();

	// State
	let dialogElement: HTMLDialogElement | undefined = $state();
	let currentIndex = $state(0);
	let suppressTransitions = $state(false);

	// Derived state
	const currentEntity = $derived(entities[currentIndex]);
	const totalCount = $derived(entities.length);
	const cardHref = $derived(
		currentEntity
			? resolve('/[locale]/cards/[id]', { locale: getLocale(), id: currentEntity.variantId })
			: ''
	);

	// Calculate visible range of cards
	const visibleCards = $derived.by(() => {
		const start = Math.max(0, currentIndex - siblingCount);
		const end = Math.min(entities.length - 1, currentIndex + siblingCount);
		const cards: { entity: Entity; offset: number }[] = [];
		for (let i = start; i <= end; i++) {
			cards.push({ entity: entities[i], offset: i - currentIndex });
		}
		return cards;
	});

	// Navigation functions
	function goToNext(): void {
		if (currentIndex < entities.length - 1) currentIndex++;
	}

	function goToPrevious(): void {
		if (currentIndex > 0) currentIndex--;
	}

	function goToFirst(): void {
		currentIndex = 0;
	}

	function goToLast(): void {
		currentIndex = entities.length - 1;
	}

	function goToIndex(index: number): void {
		currentIndex = Math.max(0, Math.min(index, entities.length - 1));
	}

	function closeCarousel(): void {
		dialogElement?.close();
	}

	// Keyboard handling
	function handleKeydown(e: KeyboardEvent): void {
		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				goToPrevious();
				break;
			case 'ArrowRight':
				e.preventDefault();
				goToNext();
				break;
			case 'Home':
				e.preventDefault();
				goToFirst();
				break;
			case 'End':
				e.preventDefault();
				goToLast();
				break;
			// Escape is handled natively by dialog
		}
	}

	// Dialog close event
	function handleDialogClose(): void {
		onclose?.();
	}

	// Public API
	export function open(index: number = 0): void {
		suppressTransitions = true;
		currentIndex = Math.max(0, Math.min(index, entities.length - 1));
		dialogElement?.showModal();
		// Re-enable transitions after the DOM has updated
		requestAnimationFrame(() => {
			suppressTransitions = false;
		});
	}

	export function close(): void {
		closeCarousel();
	}

	// Helper for CSS abs() fallback
	function absOffset(offset: number): number {
		return Math.abs(offset);
	}
</script>

<dialog
	{...standardAttributes(attributes, 'entity-carousel')}
	bind:this={dialogElement}
	onclose={handleDialogClose}
	onkeydown={handleKeydown}
>
	{#if currentEntity}
		<!-- Close button -->
		<button class="close-button" onclick={closeCarousel} aria-label="Close">X</button>

		<!-- Navigation controls -->
		<div class="controls">
			<button class="nav-button" onclick={goToPrevious} disabled={currentIndex === 0}>
				<Text ca="Anterior" es="Anterior" en="Previous" />
			</button>
			<span class="position-indicator">
				{currentIndex + 1} / {totalCount}
			</span>
			<button class="nav-button" onclick={goToNext} disabled={currentIndex === entities.length - 1}>
				<Text ca="Seguent" es="Siguiente" en="Next" />
			</button>
		</div>

		<!-- Card stage with arc positioning -->
		<div class="carousel-stage" class:suppress-transitions={suppressTransitions}>
			{#each visibleCards as { entity, offset } (entity.variantId)}
				<div
					class="carousel-card-slot"
					style="--offset:{offset};--abs-offset:{absOffset(offset)}"
					out:fade={{ duration: 300 }}
				>
					<Card
						class="carousel-card"
						{entity}
						onclick={() => {
							if (offset !== 0) {
								goToIndex(currentIndex + offset);
							}
						}}
						aria-label={offset === 0 ? undefined : `Go to card ${currentIndex + offset + 1}`}
					/>
				</div>
			{/each}
		</div>

		<!-- Actions area -->
		<div class="actions">
			<Button href={cardHref}>
				<Text ca="Obrir" es="Abrir" en="Open" />
			</Button>
			{#if actions}
				{@render actions(currentEntity)}
			{/if}
		</div>
	{/if}
</dialog>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	dialog.entity-carousel {
		position: fixed;
		inset: 0;
		margin: auto;
		width: 100vw;
		height: 100vh;
		max-width: 100vw;
		max-height: 100vh;
		background: transparent;
		border: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: rz.size(lg);
		padding: rz.size(lg);
		font-family: var(--text-font);
		color: var(--text-color);

		&::backdrop {
			background: rgba(0, 0, 0, 0.85);
		}

		&:not([open]) {
			display: none;
		}
	}

	.close-button {
		position: absolute;
		top: rz.size(lg);
		right: rz.size(lg);
		background: var(--button-background-color);
		color: var(--button-foreground-color);
		border: none;
		border-radius: rz.size(sm);
		padding: rz.size(sm) rz.size(md);
		cursor: pointer;
		font-family: var(--text-font);
		font-weight: bold;
		font-size: 1.2em;

		&:hover {
			background: var(--button-hover-background-color);
		}

		&:focus {
			outline: var(--focus-outline);
		}
	}

	.controls {
		@include rz.row(lg);
		align-items: center;
		justify-content: center;
	}

	.nav-button {
		background: var(--button-background-color);
		color: var(--button-foreground-color);
		border: none;
		border-radius: rz.size(sm);
		padding: rz.size(sm) rz.size(md);
		cursor: pointer;
		font-family: var(--text-font);
		font-weight: bold;

		&:hover:not(:disabled) {
			background: var(--button-hover-background-color);
		}

		&:focus {
			outline: var(--focus-outline);
		}

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	}

	.position-indicator {
		font-family: var(--heading-font);
		font-size: 1.2em;
		color: var(--text-heading-color);
		min-width: 6em;
		text-align: center;
	}

	.carousel-stage {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		flex: 1;
		min-height: 0;
		perspective: 1000px;
	}

	.carousel-card-slot {
		position: absolute;
		background-color: black;

		// Arc positioning using CSS custom properties
		// --offset: distance from center (-2, -1, 0, 1, 2)
		// --abs-offset: absolute value of offset (for browsers without CSS abs())
		transform: translateX(calc(var(--offset) * 12em))
			translateY(calc(var(--abs-offset) * var(--abs-offset) * 0.5em))
			rotateY(calc(var(--offset) * -3deg)) scale(calc(1 - var(--abs-offset) * 0.15));
		// Higher z-index for cards closer to center
		z-index: calc(10 - var(--abs-offset));
		transition:
			transform 0.3s ease-out,
			z-index 0s 0.15s;
		// Fade in new cards via CSS animation (can be suppressed unlike Svelte transitions)
		animation: carousel-fade-in 0.3s ease-out;

		.suppress-transitions & {
			transition: none;
			animation: none;
		}
	}

	@keyframes carousel-fade-in {
		from {
			opacity: 0;
		}
	}

	.carousel-card-slot > :global(.carousel-card) {
		// Opacity based on offset (separate from wrapper to not conflict with fade transition)
		opacity: calc(1 - var(--abs-offset) * 0.35);
		transition: opacity 0.3s ease-out;

		.suppress-transitions & {
			transition: none;
		}

		&:hover {
			opacity: 1;
		}
	}

	.actions {
		@include rz.row(md);
		align-items: center;
		justify-content: center;
	}
</style>
