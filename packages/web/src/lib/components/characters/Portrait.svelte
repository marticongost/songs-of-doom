<!--
	@component
	Displays a character portrait image, optionally with prev/next arrows
	to cycle through available portraits.

	@prop portrait - The current portrait number to display.
	@prop onChange - When provided, renders prev/next arrows; the callback
		is invoked with the new portrait number when the user cycles.
	@prop circular - When true, renders the image as a circle (e.g. for toolbar use).
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		wrapper: {
			position: 'relative',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		},
		image: {
			width: '6em',
			height: '8em',
			objectFit: 'fill',
			borderRadius: '4px',
			border: css.separators.regularBorder
		},
		circularImage: {
			width: '5em',
			height: '5em',
			objectFit: 'cover',
			borderRadius: '50%',
			border: css.separators.regularBorder
		},
		arrowButton: {
			position: 'absolute',
			bottom: 0,
			'--svg-height': '1em',
			opacity: '0.6',
			'&:hover': {
				opacity: '1'
			}
		},
		prevButton: {
			left: css.spacing.xs
		},
		nextButton: {
			right: css.spacing.xs
		}
	});
</script>

<script lang="ts">
	import { images } from '$lib/assets/img';
	import IconButton from '$lib/components/IconButton.svelte';
	import Image from '$lib/components/Image.svelte';
	import type { LocalisedText } from '@songsofdoom/common';

	interface Props {
		/** The current portrait number to display. */
		portrait: number;
		/** When provided, renders prev/next arrows to cycle available portraits. */
		onChange?: (portrait: number) => void;
		/** When true, renders as a circle (e.g. for toolbar use). */
		circular?: boolean;
	}

	const { portrait, onChange, circular = false }: Props = $props();

	const PORTRAIT_PATTERN = /^\/portraits\/(\d+)\.png$/;

	/** All available portrait numbers, sorted ascending, deduplicated. */
	const availablePortraits = $derived(
		Array.from(images.keys())
			.filter((key) => PORTRAIT_PATTERN.test(key))
			.map((key) => parseInt(key.match(PORTRAIT_PATTERN)![1], 10))
			.filter((n, i, arr) => i === 0 || n !== arr[i - 1])
			.sort((a, b) => a - b)
	);

	/** The index of the current portrait in the sorted available list. */
	const currentIndex = $derived(availablePortraits.indexOf(portrait));

	const prevLabel: LocalisedText = {
		ca: 'Anterior',
		es: 'Anterior',
		en: 'Previous'
	};

	const nextLabel: LocalisedText = {
		ca: 'Següent',
		es: 'Siguiente',
		en: 'Next'
	};

	function goPrev() {
		if (availablePortraits.length === 0) return;
		const newIndex = currentIndex <= 0 ? availablePortraits.length - 1 : currentIndex - 1;
		onChange?.(availablePortraits[newIndex]);
	}

	function goNext() {
		if (availablePortraits.length === 0) return;
		const newIndex = currentIndex >= availablePortraits.length - 1 ? 0 : currentIndex + 1;
		onChange?.(availablePortraits[newIndex]);
	}
</script>

<div class={styles.wrapper}>
	<Image
		src={`/portraits/${portrait}.png`}
		class={circular ? styles.circularImage : styles.image}
		alt=""
	/>
	{#if onChange}
		<IconButton
			src="previous.svg"
			aria-label={prevLabel}
			class={[styles.arrowButton, styles.prevButton].join(' ')}
			onclick={goPrev}
		/>
		<IconButton
			src="next.svg"
			aria-label={nextLabel}
			class={[styles.arrowButton, styles.nextButton].join(' ')}
			onclick={goNext}
		/>
	{/if}
</div>
