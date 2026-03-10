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
	import * as css from '$lib/styles';
	import { keyframes } from '@emotion/css';

	const fadeIn = keyframes`
		from {
			opacity: 0;
		}
	`;

	const styles = css.styles({
		entityCarousel: {
			position: 'fixed',
			inset: '0',
			margin: 'auto',
			width: '100vw',
			height: '100vh',
			maxWidth: '100vw',
			maxHeight: '100vh',
			background: 'transparent',
			border: 'none',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: css.spacing.lg,
			padding: css.spacing.lg,
			fontFamily: css.fonts.text,
			color: css.text.regularColor,

			'&::backdrop': {
				background: 'rgba(0, 0, 0, 0.9)'
			},

			'&:not([open])': {
				display: 'none'
			}
		},
		navButton: {
			fontSize: '2em'
		},
		closeButton: {
			fontSize: '2em',
			position: 'absolute',
			top: css.spacing.lg,
			right: css.spacing.lg
		},
		controls: {
			...css.row('lg'),
			alignItems: 'center',
			justifyContent: 'center'
		},
		positionIndicator: {
			fontFamily: css.fonts.heading,
			fontSize: '1.2em',
			color: css.text.headingColor,
			minWidth: '3em',
			textAlign: 'center'
		},
		carouselStage: {
			position: 'relative',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: '100%',
			flex: '1',
			minHeight: '0',
			perspective: '1000px',
			pointerEvents: 'none'
		},
		carouselCardSlot: {
			position: 'absolute',
			backgroundColor: 'black',
			pointerEvents: 'auto',
			transform: `
			translateX(calc(var(--offset) * 12em))
			translateY(calc(var(--abs-offset) * var(--abs-offset) * 0.5em))
			rotateY(calc(var(--offset) * -3deg)) scale(calc(1 - var(--abs-offset) * 0.15))`,
			zIndex: 'calc(10 - var(--abs-offset))',
			transition: 'transform 0.3s ease-out, z-index 0s 0.15s',
			animation: `${fadeIn} 0.3s ease-out`
		},
		carouselCard: {
			opacity: 'calc(1 - var(--abs-offset) * 0.35)',
			transition: 'opacity 0.3s ease-out',
			textAlign: 'left',
			'&:hover': {
				opacity: '1'
			}
		},
		suppressTransitions: {
			transition: 'none',
			animation: 'none'
		}
	});

	import type { Entity } from '@songsofdoom/game';

	export interface EntityCarouselApi {
		open: (index?: number) => void;
		close: () => void;
		getCurrentEntity: () => Entity | undefined;
	}
</script>

<script lang="ts">
	import { getLocale } from '$lib/context/locale';
	import { entityUrl } from '$lib/urls';
	import { cx } from '@emotion/css';
	import { translate } from '@songsofdoom/common';
	import { fade } from 'svelte/transition';
	import IconButton from '../IconButton.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Toolbar from '../toolbar/Toolbar.svelte';
	import ToolbarButton from '../toolbar/ToolbarButton.svelte';
	import Card from './Card.svelte';
	import { isLocked } from './common';
	import type { EntityManager } from './entitymanager';
	import EntityToolbar from './EntityToolbar.svelte';

	interface Props extends StandardAttributeProps {
		/** All entities available for viewing */
		entities: Entity[];

		/** Number of sibling cards to show on each side (default: 2) */
		siblingCount?: number;

		/** Entity manager for handling actions. When omitted, shows a view-only carousel. */
		entityManager?: EntityManager;

		/** Callback when carousel is closed */
		onclose?: () => void;

		/** Whether to visually dim unavailable entities. */
		dimLocked?: boolean;
	}

	const {
		entities,
		siblingCount = 2,
		entityManager,
		onclose,
		dimLocked = false,
		...attributes
	}: Props = $props();

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

	export function getCurrentEntity(): Entity | undefined {
		return currentEntity;
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
	{...standardAttributes(attributes, styles.entityCarousel)}
	bind:this={dialogElement}
	onclose={handleDialogClose}
	onclick={handleDialogClick}
	onwheel={handleDialogWheel}
	onkeydown={handleKeydown}
>
	{#if currentEntity}
		<!-- Close button -->
		<IconButton
			class={styles.closeButton}
			src="close-dialog.svg"
			onclick={closeCarousel}
			aria-label={translate({ ca: 'Tancar', es: 'Cerrar', en: 'Close' }, getLocale())}
		/>

		<!-- Navigation controls -->
		<div class={styles.controls}>
			<IconButton
				class={styles.navButton}
				src="previous.svg"
				onclick={goToPrevious}
				disabled={currentIndex === 0}
				aria-label={translate({ ca: 'Anterior', es: 'Anterior', en: 'Previous' }, getLocale())}
			/>
			<span class={styles.positionIndicator}>
				{currentIndex + 1} / {totalCount}
			</span>
			<IconButton
				class={styles.navButton}
				src="next.svg"
				onclick={goToNext}
				disabled={currentIndex === entities.length - 1}
				aria-label={translate({ ca: 'Seguent', es: 'Siguiente', en: 'Next' }, getLocale())}
			/>
		</div>

		<!-- Card stage with arc positioning -->
		<div class={cx(styles.carouselStage, { [styles.suppressTransitions]: suppressTransitions })}>
			{#each visibleCards as { entity, offset } (entity.variantId)}
				<div
					class={cx(styles.carouselCardSlot, { [styles.suppressTransitions]: suppressTransitions })}
					style="--offset:{offset};--abs-offset:{absOffset(offset)}"
					out:fade={{ duration: 300 }}
				>
					<Card
						class={cx(styles.carouselCard, { [styles.suppressTransitions]: suppressTransitions })}
						{entity}
						onclick={() => {
							if (offset !== 0) {
								goToIndex(currentIndex + offset);
							}
						}}
						aria-label={offset === 0 ? undefined : `Go to card ${currentIndex + offset + 1}`}
						{entityManager}
						dimmed={dimLocked && isLocked(entity, entityManager)}
					/>
				</div>
			{/each}
		</div>

		{#if entityManager}
			<EntityToolbar entity={currentEntity} {entityManager} />
		{:else}
			<Toolbar>
				<ToolbarButton
					icon="open.svg"
					href={entityUrl.get(currentEntity)}
					label={{ ca: 'Obrir', es: 'Abrir', en: 'Open' }}
					target="_blank"
				/>
			</Toolbar>
		{/if}
	{/if}
</dialog>
