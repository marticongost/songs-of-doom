<script lang="ts" module>
	import cardHeadingBackground from '$lib/assets/img/card-heading.png?url';
	import cardSubheadingBackground from '$lib/assets/img/card-subheading.png?url';
	import storyFrame from '$lib/assets/img/story-frame.png?url';
	import * as css from '$lib/styles';

	const cardPrintWidth = 64;
	const cardPrintHeight = 89;
	const postcardPrintWidth = 93;
	const postcardPrintHeight = 146;
	const cardScreenWidth = 24;
	const cardContentScale = 2.3;
	const headerPadding = css.spacing.sm;

	const styles = css.styles({
		card: {
			position: 'relative',
			border: css.separators.regularBorder,
			borderRadius: '0.5em',
			backgroundColor: css.palette.somber,
			fontSize: `${(cardScreenWidth / cardPrintWidth) * cardContentScale}em`,
			width: `${cardPrintWidth / cardContentScale}em`,
			height: `${cardPrintHeight / cardContentScale}em`,
			overflow: 'clip',
			...css.colorBindings.cardBackgrounds.rules('data-type', (color) => ({
				'--main-background': color.main.background,
				'--secondary-background': color.secondary.background
			})),
			'@media print': {
				fontSize: `${cardContentScale}mm`
			},
			'--card-toolbar-container-offset': '100%',
			'&:focus-within': {
				'--card-toolbar-container-offset': 0,
				borderColor: css.focus.outlineColor,
				outline: 'none'
			}
		},
		postcardCard: {
			fontSize: `${(cardScreenWidth / postcardPrintWidth) * cardContentScale}em`,
			width: `${postcardPrintWidth / cardContentScale}em`,
			height: `${postcardPrintHeight / cardContentScale}em`
		},
		discardReward: {
			position: 'absolute',
			top: css.spacing.sm,
			left: css.spacing.sm,
			fontSize: '1.4em',
			boxShadow: '0 0 1em rgba(0, 0, 0, 0.5)'
		},
		content: {
			...css.column(),
			alignItems: 'stretch',
			height: '100%'
		},
		imageRow: {
			...css.row(),
			alignItems: 'stretch',
			position: 'relative'
		},
		image: {
			flex: 1,
			minWidth: 0,
			height: `${(cardPrintWidth / cardContentScale) * (9 / 16)}em`,
			objectFit: 'cover',
			objectPosition: 'center'
		},
		dimmedImage: {
			filter: 'grayscale(100%) brightness(0.8)',
			opacity: '0.7'
		},
		header: {
			...css.row(),
			position: 'relative',
			borderBottom: css.separators.regularBorder,
			background: `url('${cardHeadingBackground}') center / cover`,
			'&::before': {
				content: "''",
				position: 'absolute',
				inset: '0',
				backgroundImage: 'var(--main-background)',
				opacity: '0.7'
			},
			'> *': {
				position: 'relative'
			}
		},
		title: {
			padding: headerPadding,
			fontFamily: css.fonts.heading,
			fontSize: '1.4em',
			fontWeight: 'bold',
			color: css.text.headingColor,
			textShadow: '0 0 0.5em rgba(0, 0, 0, 0.8)'
		},
		setFrame: {
			backgroundColor: 'rgba(0, 0, 0, 0.2)',
			borderRight: '1px solid rgba(0, 0, 0, 0.1)',
			width: '3em',
			height: '100%',
			flex: '0 0 auto',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		},
		setIcon: {
			height: '2.1em',
			filter: 'drop-shadow(0 0 0.8rem black)',
			color: 'rgba(255, 255, 255, 0.7)'
		},
		acquisition: {
			...css.row('sm'),
			padding: headerPadding,
			marginLeft: 'auto'
		},
		requiredEntity: {
			fontSize: '0.9em',
			opacity: '0.7'
		},
		indicators: {
			...css.row('xs'),
			position: 'absolute',
			bottom: css.spacing.xs,
			right: css.spacing.xs,
			fontSize: '1.5em'
		},
		entityManagerIndicators: {
			fontSize: '1.2em'
		},
		details: {
			...css.row('sm'),
			padding: css.spacing.sm,
			position: 'relative',
			borderTop: 'var(--panel-separator)',
			borderBottom: 'var(--panel-separator)',
			background: `url('${cardSubheadingBackground}') center / cover`,
			'&::before': {
				content: "''",
				position: 'absolute',
				inset: '0',
				backgroundImage: 'var(--secondary-background)',
				opacity: '0.7'
			},
			'> *': {
				position: 'relative'
			}
		},
		body: {
			...css.column('sm'),
			alignItems: 'stretch',
			flex: '1 1 auto'
		},
		storyBody: {
			backgroundRepeat: 'repeat',
			borderWidth: '10px',
			borderImageSource: `url('${storyFrame}')`,
			borderImageSlice: '39 46',
			borderImageRepeat: 'round',
			borderStyle: 'solid'
		},
		capabilities: {
			padding: css.spacing.sm,
			flex: '1 1 auto'
		},
		disciplines: {
			padding: css.spacing.sm,
			paddingBottom: '0'
		},
		requiredTalent: {
			padding: css.spacing.sm,
			paddingBottom: '0'
		},
		acquisitionIndicator: {
			fontSize: '1.1em',
			alignSelf: 'center'
		},
		disciplinesTitle: {
			fontWeight: 'bold',
			color: css.text.highlightColor,
			'--svg-color': css.text.subtleColor,
			svg: {
				flex: '0 0 auto',
				position: 'relative',
				top: `calc(${css.spacing.xs} * -0.5)`,
				color: css.text.subtleColor
			}
		},
		requiredTalentTitle: {
			fontWeight: 'bold',
			color: css.text.highlightColor
		},
		requiredTalentIcon: {
			color: css.text.subtleColor,
			flex: '0 0 auto',
			position: 'relative',
			top: `calc(${css.spacing.xs} * -0.5)`
		},
		attachment: {
			padding: css.spacing.sm,
			marginTop: 'auto',
			backgroundColor: 'rgba(0, 0, 0, 0.2)',
			flex: '0 0 auto'
		},
		attachmentTitle: {
			fontWeight: 'bold',
			fontFamily: css.fonts.heading,
			color: css.text.headingColor,
			marginBottom: css.spacing.sm
		},
		toolbarContainer: {
			position: 'absolute',
			bottom: '0',
			left: '0',
			right: '0',
			transform: 'translateY(var(--card-toolbar-container-offset))',
			transition: 'transform 0.2s ease-out',
			willChange: 'transform'
		}
	});

	import { Archetype, Discipline, Module, Scenario } from '@songsofdoom/game';
	const getSetIcon = (set: Archetype | Discipline | Module): string => {
		if (set instanceof Archetype) {
			return `archetypes/${set.id}.svg`;
		} else if (set instanceof Discipline) {
			return `disciplines/${set.id}.svg`;
		} else if (set instanceof Scenario) {
			return `campaigns/${set.parent!.id}/${set.id}.svg`;
		} else {
			return `modules/${set.id}.svg`;
		}
	};
</script>

<script lang="ts">
	import CapabilityList from '$lib/components/capabilities/CapabilityList.svelte';
	import DisciplineList from '$lib/components/disciplines/DisciplineList.svelte';
	import type { EntityManager } from '$lib/components/entities/entitymanager';
	import Text from '$lib/components/localisation/Text.svelte';
	import PropertyList from '$lib/components/properties/PropertyList.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { entityUrl } from '$lib/urls';
	import { cx } from '@emotion/css';
	import type { Entity } from '@songsofdoom/game';
	import {
		Ally,
		attributeTypes,
		Creature,
		isArchetype,
		isItem,
		isScenario,
		isStory,
		Item,
		Skill
	} from '@songsofdoom/game';
	import CapabilityCostList from '../capabilities/CapabilityCostList.svelte';
	import ChargesChip from '../capabilities/ChargesChip.svelte';
	import Image from '../Image.svelte';
	import CardCopiesIndicator from '../indicators/CardCopiesIndicator.svelte';
	import ExperienceIndicator from '../indicators/ExperienceIndicator.svelte';
	import GoldIndicator from '../indicators/GoldIndicator.svelte';
	import HealthIndicator from '../indicators/HealthIndicator.svelte';
	import SanityIndicator from '../indicators/SanityIndicator.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import ScenarioSigils from '../scenarios/ScenarioSigils.svelte';
	import AttributesSheet from '../StatsSheet.svelte';
	import TalentChip from '../talents/TalentChip.svelte';
	import CardLevel from './CardLevel.svelte';
	import EntityToolbar from './EntityToolbar.svelte';

	interface Props extends StandardAttributeProps {
		entity: Entity;

		/** Render as a link to the card detail page (default: true) */
		linked?: boolean;

		/** Click handler - when provided, renders as a button instead of a link */
		onclick?: (e: MouseEvent) => void;

		/** Optional entity manager for state and interactions */
		entityManager?: EntityManager;

		/** Whether to visually dim the card */
		dimmed?: boolean;
	}

	const {
		entity,
		linked = true,
		onclick,
		entityManager,
		dimmed = false,
		...rest
	}: Props = $props();

	// Determine the element type: button if onclick, anchor if linked, div otherwise
	const elementType = $derived(onclick ? 'button' : linked ? 'a' : 'div');
	const ispostcard = $derived(entity.type.id === 'story');
	const discardReward = $derived(entity instanceof Skill ? entity.discardReward : undefined);
	const hasToolbar = $derived(entityManager && !onclick);
	const hasImage = $derived(!isScenario(entity));
	const hasDetails = $derived(!isScenario(entity) && !isStory(entity));

	let cardElement: HTMLElement | undefined;

	const passFocusToToolbar = () => {
		const firstFocusable = cardElement?.querySelector(
			'.toolbar-container button:not(:disabled), .toolbar-container a'
		);
		if (firstFocusable instanceof HTMLElement) {
			firstFocusable.focus({ preventScroll: true });
		}
	};
</script>

<svelte:element
	this={elementType}
	bind:this={cardElement}
	href={elementType === 'a' ? entityUrl.get(entity) : undefined}
	type={elementType === 'button' ? 'button' : undefined}
	tabindex={elementType === 'div' && entityManager ? -1 : undefined}
	{onclick}
	{...standardAttributes(rest, cx(styles.card, ispostcard && styles.postcardCard))}
	data-type={entity.type.id}
	data-entity={entity.id}
	onfocus={hasToolbar ? passFocusToToolbar : undefined}
>
	<div class={styles.content}>
		<div class={styles.header}>
			{#if entity.set}
				<div class={styles.setFrame}>
					<InlineSvg class={styles.setIcon} src={getSetIcon(entity.set)} />
				</div>
			{/if}
			<div class={styles.title}><Text {...entity.title} /></div>
			<CardLevel {entity} />
			<div class={styles.acquisition}>
				{#if entity.requiredEntity}
					<div class={styles.requiredEntity}>
						<Text {...entity.requiredEntity.title} />
					</div>
				{/if}
				{#if entity.xpCost !== undefined}
					<ExperienceIndicator amount={entity.xpCost} class={styles.acquisitionIndicator} />
				{/if}
				{#if entity.goldCost !== undefined}
					<GoldIndicator amount={entity.goldCost} class={styles.acquisitionIndicator} />
				{/if}
				{#if entityManager}
					<div class={styles.entityManagerIndicators}>
						<CardCopiesIndicator amount={entityManager.getNumberOfOwnedCopies(entity)} />
					</div>
				{/if}
			</div>
		</div>
		{#if hasImage}
			<div class={styles.imageRow}>
				{#if entity instanceof Creature || entity instanceof Ally}
					<AttributesSheet stats={entity.stats} statTypes={attributeTypes} />
					<div class={styles.indicators}>
						<HealthIndicator amount={entity.stats.health} contrast={true} />
						{#if entity instanceof Ally}
							<SanityIndicator amount={entity.stats.sanity} contrast={true} />
						{/if}
					</div>
				{/if}
				<Image
					class={cx(styles.image, { [styles.dimmedImage]: dimmed })}
					src="cards/{entity.id}.jpg"
				/>
				{#if discardReward && !discardReward.empty()}
					<CapabilityCostList class={styles.discardReward} cost={discardReward} layout="column" />
				{/if}
			</div>
		{/if}
		{#if hasDetails}
			<div class={styles.details}>
				<PropertyList style="margin-right: auto" properties={entity.properties} />
				{#if entity.maxCharges}
					<ChargesChip charges={entity.maxCharges} />
				{/if}
				{#if entity instanceof Item && entity.slot}
					<InlineSvg src="slots/{entity.slot.type}.svg" />
				{/if}
			</div>
		{/if}
		<div class={cx(styles.body, isStory(entity) && styles.storyBody)}>
			{#if entity.description}
				<div>{entity.description}</div>
			{/if}

			{#if isScenario(entity)}
				<ScenarioSigils sigils={entity.sigils} />
			{/if}

			{#if isItem(entity) && entity.requiredTalent}
				<div class={styles.requiredTalent}>
					<span class={styles.requiredTalentTitle}>
						<InlineSvg class={styles.requiredTalentIcon} src="lock.svg" />
						<Text ca="Requereix:" es="Requiere:" en="Requires:" />
					</span>
					<TalentChip talent={entity.requiredTalent} />
				</div>
			{:else if isArchetype(entity) && entity.disciplines.length}
				<div class={styles.disciplines}>
					<span class={styles.disciplinesTitle}>
						<InlineSvg src="unlock.svg" />
						<Text ca="Disciplines:" es="Disciplinas:" en="Disciplines:" />
					</span>
					<DisciplineList disciplines={entity.disciplines} />
				</div>
			{/if}

			<CapabilityList class={styles.capabilities} capabilities={entity.capabilities} />
			{#if entity.attachmentCapabilities.length > 0}
				<div class={styles.attachment}>
					<div class={styles.attachmentTitle}>
						<Text ca="Mentre estigui vinculada" es="Mientras esté vinculada" en="While attached" />
					</div>
					<CapabilityList capabilities={entity.attachmentCapabilities} />
				</div>
			{/if}
		</div>
	</div>
	{#if entityManager && hasToolbar}
		<div class={styles.toolbarContainer}>
			<EntityToolbar {entity} {entityManager} />
		</div>
	{/if}
</svelte:element>
