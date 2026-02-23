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
	import { getLocale } from '$lib/context/locale';
	import { translate } from '@songsofdoom/common';
	import type { Entity } from '@songsofdoom/game';
	import { fade } from 'svelte/transition';
	import IconButton from '../IconButton.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Card from './Card.svelte';
	import type { EntityManager } from './entitymanager';
	import EntityToolbar from './EntityToolbar.svelte';

	interface Props extends StandardAttributeProps {
		/** All entities available for viewing */
		entities: Entity[];
		/** Number of sibling cards to show on each side (default: 2) */
		siblingCount?: number;
		/** Entity manager for handling actions */
		entityManager: EntityManager;
		/** Callback when carousel is closed */
		onclose?: () => void;
	}

	const { entities, siblingCount = 2, entityManager, onclose, ...attributes }: Props = $props();

	// State
	let dialogElement: HTMLDialogElement | undefined = $state();
	let currentIndex = $state(0);
	let suppressTransitions = $state(false);
	let cleanupScrollLock: (() => void) | undefined;
	let lastWheelNavigationAt = 0;

	// Derived state
	const currentEntity = $derived(entities[currentIndex]);
	const totalCount = $derived(entities.length);

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

	function lockDocumentScroll(): () => void {
		if (typeof window === 'undefined') {
			return () => {};
		}

		const html = document.documentElement;
		const body = document.body;
		const scrollY = window.scrollY;
		const previousHtmlOverflow = html.style.overflow;
		const previousBodyOverflow = body.style.overflow;
		const previousBodyPosition = body.style.position;
		const previousBodyTop = body.style.top;
		const previousBodyWidth = body.style.width;

		html.style.overflow = 'hidden';
		body.style.overflow = 'hidden';
		body.style.position = 'fixed';
		body.style.top = `-${scrollY}px`;
		body.style.width = '100%';

		const preventPageScroll = (event: WheelEvent | TouchEvent): void => {
			if (!dialogElement?.contains(event.target as Node)) {
				event.preventDefault();
			}
		};

		window.addEventListener('wheel', preventPageScroll, { passive: false });
		window.addEventListener('touchmove', preventPageScroll, { passive: false });

		return () => {
			window.removeEventListener('wheel', preventPageScroll);
			window.removeEventListener('touchmove', preventPageScroll);

			html.style.overflow = previousHtmlOverflow;
			body.style.overflow = previousBodyOverflow;
			body.style.position = previousBodyPosition;
			body.style.top = previousBodyTop;
			body.style.width = previousBodyWidth;

			window.scrollTo(0, scrollY);
		};
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
		cleanupScrollLock?.();
		cleanupScrollLock = undefined;
		onclose?.();
	}

	// Close when clicking background (dialog itself, not its content)
	function handleDialogClick(e: MouseEvent): void {
		if (e.target === dialogElement) {
			closeCarousel();
		}
	}

	function handleDialogWheel(e: WheelEvent): void {
		e.preventDefault();

		const now = Date.now();
		if (now - lastWheelNavigationAt < 140) {
			return;
		}

		if (e.deltaY > 0) {
			goToNext();
			lastWheelNavigationAt = now;
			return;
		}

		if (e.deltaY < 0) {
			goToPrevious();
			lastWheelNavigationAt = now;
		}
	}

	// Public API
	export function open(index: number = 0): void {
		suppressTransitions = true;
		currentIndex = Math.max(0, Math.min(index, entities.length - 1));
		cleanupScrollLock?.();
		cleanupScrollLock = lockDocumentScroll();
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

	$effect(() => {
		return () => {
			cleanupScrollLock?.();
			cleanupScrollLock = undefined;
		};
	});
</script>

<dialog
	{...standardAttributes(attributes, 'entity-carousel')}
	bind:this={dialogElement}
	onclose={handleDialogClose}
	onclick={handleDialogClick}
	onwheel={handleDialogWheel}
	onkeydown={handleKeydown}
>
	{#if currentEntity}
		<!-- Close button -->
		<IconButton
			class="close-button"
			src="close-dialog.svg"
			onclick={closeCarousel}
			aria-label={translate({ ca: 'Tancar', es: 'Cerrar', en: 'Close' }, getLocale())}
		/>

		<!-- Navigation controls -->
		<div class="controls">
			<IconButton
				class="nav-button"
				src="previous.svg"
				onclick={goToPrevious}
				disabled={currentIndex === 0}
				aria-label={translate({ ca: 'Anterior', es: 'Anterior', en: 'Previous' }, getLocale())}
			/>
			<span class="position-indicator">
				{currentIndex + 1} / {totalCount}
			</span>
			<IconButton
				class="nav-button"
				src="next.svg"
				onclick={goToNext}
				disabled={currentIndex === entities.length - 1}
				aria-label={translate({ ca: 'Seguent', es: 'Siguiente', en: 'Next' }, getLocale())}
			/>
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

		<EntityToolbar entity={currentEntity} {entityManager} />
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
			background: rgba(0, 0, 0, 0.9);
		}

		&:not([open]) {
			display: none;
		}

		:global(.nav-button) {
			font-size: 2em;
		}

		:global(.close-button) {
			font-size: 2em;
			position: absolute;
			top: rz.size(lg);
			right: rz.size(lg);
		}
	}

	.controls {
		@include rz.row(lg);
		align-items: center;
		justify-content: center;
	}

	.position-indicator {
		font-family: var(--heading-font);
		font-size: 1.2em;
		color: var(--text-heading-color);
		min-width: 3em;
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
		pointer-events: none;
	}

	.carousel-card-slot {
		position: absolute;
		background-color: black;
		pointer-events: auto;

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
</style>
