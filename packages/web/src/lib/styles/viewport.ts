import type { CSSObject } from '@emotion/css/create-instance';

export const viewportSizes: Array<ViewportSize> = [];

export type ViewportSizeId = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ViewportSizeRange {
	/** Returns the inclusive minimum width of the selected viewport sizes, in pixels. */
	readonly minWidth: number;

	/** Returns the inclusive maximum width of the selected viewport sizes, in pixels. */
	readonly maxWidth: number | undefined;

	/** Returns the media condition (without the leading `@media`) matching the selected viewport sizes. */
	media(): string;

	/** Returns the media query matching the selected viewport sizes. */
	selector(): string;

	/** Returns the media condition (without the leading `@media`) matching all sizes not included in the selected viewport sizes. */
	inverseMedia(): string;

	/** Returns the media query matching all sizes not included in the selected viewport sizes. */
	inverseSelector(): string;

	/** Returns a CSS object applying only at the selected viewport sizes. */
	then(styles: CSSObject): CSSObject;

	/** Returns a CSS object applying only at all sizes not included in the selected viewport sizes. */
	not(styles: CSSObject): CSSObject;

	/** Returns a CSS object that hides the element for the selected viewport sizes. */
	hide(styles: CSSObject): CSSObject;
}

export class ViewportQuery implements ViewportSizeRange {
	/** Returns the inclusive minimum width of the selected viewport sizes, in pixels. */
	readonly minWidth: number;

	/** Returns the inclusive maximum width of the selected viewport sizes, in pixels. */
	readonly maxWidth: number | undefined;

	constructor(minWidth: number, maxWidth?: number) {
		this.minWidth = minWidth;
		this.maxWidth = maxWidth;
	}

	/** Returns the media condition (without the leading `@media`) matching the selected viewport sizes. */
	media(): string {
		if (this.minWidth === 0 && this.maxWidth === undefined) return 'all';
		if (this.minWidth === 0) return `(max-width: ${this.maxWidth}px)`;
		if (this.maxWidth === undefined) return `(min-width: ${this.minWidth}px)`;
		return `(min-width: ${this.minWidth}px) and (max-width: ${this.maxWidth}px)`;
	}

	/** Returns the media query matching the selected viewport sizes. */
	selector(): string {
		return `@media ${this.media()}`;
	}

	/** Returns the media condition (without the leading `@media`) matching all sizes not included in the selected viewport sizes. */
	inverseMedia(): string {
		if (this.minWidth === 0 && this.maxWidth === undefined) return 'not all';
		if (this.minWidth === 0) return `(min-width: ${this.maxWidth! + 1}px)`;
		if (this.maxWidth === undefined) return `(max-width: ${this.minWidth - 1}px)`;
		return `(max-width: ${this.minWidth - 1}px), (min-width: ${this.maxWidth + 1}px)`;
	}

	/** Returns the media query matching all sizes not included in the selected viewport sizes. */
	inverseSelector(): string {
		return `@media ${this.inverseMedia()}`;
	}

	/** Returns a CSS object applying only at the selected viewport sizes. */
	then(styles: CSSObject): CSSObject {
		return { [this.selector()]: styles };
	}

	/** Returns a CSS object applying only at all sizes not included in the selected viewport sizes. */
	not(styles: CSSObject): CSSObject {
		return { [this.inverseSelector()]: styles };
	}

	/** Returns a CSS object that hides the element for the selected viewport sizes. */
	hide(): CSSObject {
		return { [this.selector()]: { display: 'none' } };
	}
}

export class ViewportSize implements ViewportSizeRange {
	readonly id: ViewportSizeId;
	readonly index: number;
	readonly minWidth: number;

	constructor(id: ViewportSizeId, index: number, minWidth: number) {
		this.id = id;
		this.index = index;
		this.minWidth = minWidth;
	}

	/** Returns the previous viewport size, or undefined if this is the smallest size. */
	get previous(): ViewportSize | undefined {
		return viewportSizes[this.index - 1];
	}

	/** Returns the next viewport size, or undefined if this is the largest size. */
	get next(): ViewportSize | undefined {
		return viewportSizes[this.index + 1];
	}

	get maxWidth(): number | undefined {
		return this.next ? this.next.minWidth - 1 : undefined;
	}

	/** Returns a media query object matching this viewport size. */
	exactly(): ViewportQuery {
		return new ViewportQuery(this.minWidth, this.maxWidth);
	}

	/** Returns a media query object matching all sizes larger than this viewport size. */
	larger(): ViewportQuery {
		if (!this.next) throw new Error(`No larger viewport size than ${this.id}`);
		return new ViewportQuery(this.next.minWidth);
	}

	/** Returns a media query object matching this viewport size and all larger sizes. */
	orLarger(): ViewportQuery {
		return new ViewportQuery(this.minWidth);
	}

	/** Returns a media query object matching all sizes smaller than this viewport size. */
	smaller(): ViewportQuery {
		if (!this.previous) throw new Error(`No smaller viewport size than ${this.id}`);
		return new ViewportQuery(0, this.previous.maxWidth);
	}

	/** Returns a media query object matching this viewport size and all smaller sizes. */
	orSmaller(): ViewportQuery {
		return new ViewportQuery(0, this.maxWidth);
	}

	/** Returns the media condition (without the leading `@media`) matching this viewport size. */
	media(): string {
		return this.exactly().media();
	}

	/** Returns the media query matching this viewport size. */
	selector(): string {
		return this.exactly().selector();
	}

	/** Returns the media condition (without the leading `@media`) matching all sizes not included in this viewport size. */
	inverseMedia(): string {
		return this.exactly().inverseMedia();
	}

	/** Returns the media query matching all sizes not included in this viewport size. */
	inverseSelector(): string {
		return this.exactly().inverseSelector();
	}

	/** Returns a CSS object applying only at the selected viewport sizes. */
	then(styles: CSSObject): CSSObject {
		return this.exactly().then(styles);
	}

	/** Returns a CSS object applying only at all sizes not included in the selected viewport sizes. */
	not(styles: CSSObject): CSSObject {
		return this.exactly().not(styles);
	}

	/** Returns a CSS object that hides the element for this viewport size. */
	hide(): CSSObject {
		return this.exactly().hide();
	}
}

const createViewportSize = (id: ViewportSizeId, minWidth: number) => {
	const viewportSize = new ViewportSize(id, viewportSizes.length, minWidth);
	viewportSizes.push(viewportSize);
	return viewportSize;
};

export const xs = createViewportSize('xs', 0);
export const sm = createViewportSize('sm', 576);
export const md = createViewportSize('md', 768);
export const lg = createViewportSize('lg', 992);
export const xl = createViewportSize('xl', 1200);

/** Returns all defined viewport sizes. */
export const getSizes = () => viewportSizes;

/** Returns the current viewport size. */
export const getCurrentSize = (): ViewportSize => {
	const width = window.innerWidth;
	return (
		viewportSizes.find((size) => width >= size.minWidth && width <= (size.maxWidth ?? Infinity)) ??
		xs
	);
};
