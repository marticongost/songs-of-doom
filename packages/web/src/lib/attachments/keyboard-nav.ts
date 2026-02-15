import type { Attachment } from 'svelte/attachments';

export type NavMode = 'row' | 'column' | 'grid';

export interface KeyboardNavOptions {
	/** Navigation mode: 'row' (left/right), 'column' (up/down), or 'grid' (all arrows) */
	mode: NavMode;
	/** CSS selector for focusable items (default: 'a, [tabindex]') */
	itemSelector?: string;
	/** Override: called on Escape/Up from first (default: focus search input) */
	onEscape?: () => void;
}

/**
 * Keyboard navigation handler for lists and grids.
 * Implements the roving tabindex pattern for accessible keyboard navigation.
 *
 * @example
 * ```svelte
 * const nav = new KeyboardNavigation({ mode: 'grid' });
 *
 * <SearchInput {@attach nav.searchInputAttachment()} />
 * <EntityGrid keyboardNav={nav} />
 * ```
 */
export class KeyboardNavigation {
	private container: HTMLElement | null = null;
	private searchInput: HTMLElement | null = null;
	private ariaSetup = false;
	private readonly mode: NavMode;
	private readonly itemSelector: string;
	private readonly customOnEscape?: () => void;

	constructor(options: KeyboardNavOptions) {
		this.mode = options.mode;
		this.itemSelector = options.itemSelector ?? 'a, [tabindex]';
		this.customOnEscape = options.onEscape;
	}

	/** Default escape behavior: focus the search input if attached */
	private onEscape(): void {
		if (this.customOnEscape) {
			this.customOnEscape();
		} else {
			this.searchInput?.focus();
		}
	}

	// --- Query Methods ---

	/** Get all navigable items in the container */
	getItems(): HTMLElement[] {
		if (!this.container) return [];
		return Array.from(this.container.querySelectorAll<HTMLElement>(this.itemSelector));
	}

	/** Find the first item */
	findFirst(): HTMLElement | null {
		return this.getItems()[0] ?? null;
	}

	/** Find the last item */
	findLast(): HTMLElement | null {
		const items = this.getItems();
		return items[items.length - 1] ?? null;
	}

	/** Find next item in array order (for Left/Right navigation) */
	findNext(current: HTMLElement): HTMLElement | null {
		const items = this.getItems();
		const index = items.indexOf(current);
		return items[index + 1] ?? null;
	}

	/** Find previous item in array order (for Left/Right navigation) */
	findPrevious(current: HTMLElement): HTMLElement | null {
		const items = this.getItems();
		const index = items.indexOf(current);
		return items[index - 1] ?? null;
	}

	/** Find item above (for grid Up navigation) */
	findAbove(current: HTMLElement): HTMLElement | null {
		const items = this.getItems();
		const rect = current.getBoundingClientRect();
		// Find items with lower Y (above)
		const candidates = items.filter((el) => el.getBoundingClientRect().top < rect.top - 1);
		if (candidates.length === 0) return null;
		// Pick the one closest to current position (closest Y first, then closest X)
		return candidates.reduce((best, el) => {
			const elRect = el.getBoundingClientRect();
			const bestRect = best.getBoundingClientRect();
			if (elRect.top > bestRect.top) return el; // Prefer higher Y (closer)
			if (elRect.top === bestRect.top) {
				// Same row: prefer closer X
				if (Math.abs(elRect.left - rect.left) < Math.abs(bestRect.left - rect.left)) return el;
			}
			return best;
		});
	}

	/** Find item below (for grid Down navigation) */
	findBelow(current: HTMLElement): HTMLElement | null {
		const items = this.getItems();
		const rect = current.getBoundingClientRect();
		// Find items with higher Y (below)
		const candidates = items.filter((el) => el.getBoundingClientRect().top > rect.top + 1);
		if (candidates.length === 0) return null;
		// Pick the one closest to current position (lowest Y first, then closest X)
		return candidates.reduce((best, el) => {
			const elRect = el.getBoundingClientRect();
			const bestRect = best.getBoundingClientRect();
			if (elRect.top < bestRect.top) return el; // Prefer lower Y (closer)
			if (elRect.top === bestRect.top) {
				// Same row: prefer closer X
				if (Math.abs(elRect.left - rect.left) < Math.abs(bestRect.left - rect.left)) return el;
			}
			return best;
		});
	}

	/** Check if element is in the first row */
	isInFirstRow(element: HTMLElement): boolean {
		const items = this.getItems();
		if (items.length === 0) return false;
		const firstY = items[0].getBoundingClientRect().top;
		const currentY = element.getBoundingClientRect().top;
		return Math.abs(currentY - firstY) < 1;
	}

	// --- Focus Methods ---

	/** Focus a specific item and update tabindex */
	focusItem(element: HTMLElement): void {
		// Setup ARIA attributes lazily on first focus
		this.setupAriaAttributes();

		// Update roving tabindex - set focused item to 0, others to -1
		for (const item of this.getItems()) {
			item.tabIndex = item === element ? 0 : -1;
		}
		element.focus();
	}

	/** Focus the first item */
	focusFirst(): void {
		const first = this.findFirst();
		if (first) this.focusItem(first);
	}

	/** Focus the last item */
	focusLast(): void {
		const last = this.findLast();
		if (last) this.focusItem(last);
	}

	// --- Attachments ---

	/** Returns a Svelte attachment for the results container */
	resultsAttachment(): Attachment<HTMLElement> {
		return (element: HTMLElement) => {
			this.container = element;
			// Don't setup roving tabindex immediately - do it lazily when first item is focused
			// This avoids timing issues with dynamic content and keeps Tab working naturally

			const handleKeydown = (e: KeyboardEvent) => this.handleKeydown(e);
			element.addEventListener('keydown', handleKeydown);

			return () => {
				element.removeEventListener('keydown', handleKeydown);
				this.container = null;
				this.ariaSetup = false;
			};
		};
	}

	/** Returns a Svelte attachment for the search input (or its wrapper) */
	searchInputAttachment(): Attachment<HTMLElement> {
		return (element: HTMLElement) => {
			// Find the actual input element (handles wrapper components)
			const input = element.tagName === 'INPUT' ? element : element.querySelector('input');
			if (!input) return;

			this.searchInput = input;

			const handleKeydown = (e: KeyboardEvent) => {
				// ArrowDown focuses first result
				if (e.key === 'ArrowDown') {
					const first = this.findFirst();
					if (first) {
						e.preventDefault();
						this.focusItem(first);
					}
				}
			};
			input.addEventListener('keydown', handleKeydown);
			return () => {
				input.removeEventListener('keydown', handleKeydown);
				this.searchInput = null;
			};
		};
	}

	// --- Private Methods ---

	private setupAriaAttributes(): void {
		if (!this.container || this.ariaSetup) return;
		this.ariaSetup = true;
		this.container.setAttribute('role', this.mode === 'grid' ? 'grid' : 'listbox');
		const itemRole = this.mode === 'grid' ? 'gridcell' : 'option';
		for (const item of this.getItems()) {
			item.setAttribute('role', itemRole);
		}
	}

	private handleKeydown(e: KeyboardEvent): void {
		const target = e.target as HTMLElement;
		// Find the item element - target might be a descendant of the actual item
		const items = this.getItems();
		const item = items.find((el) => el === target || el.contains(target));
		if (!item) return;

		switch (e.key) {
			case 'ArrowUp':
				this.handleUp(item, e);
				break;
			case 'ArrowDown':
				this.handleDown(item, e);
				break;
			case 'ArrowLeft':
				this.handleLeft(item, e);
				break;
			case 'ArrowRight':
				this.handleRight(item, e);
				break;
			case 'Home':
				e.preventDefault();
				this.focusFirst();
				break;
			case 'End':
				e.preventDefault();
				this.focusLast();
				break;
			case 'Escape':
				this.onEscape();
				break;
		}
	}

	private handleUp(target: HTMLElement, e: KeyboardEvent): void {
		if (this.mode === 'row') return;
		e.preventDefault();
		if (this.mode === 'column') {
			const prev = this.findPrevious(target);
			if (prev) this.focusItem(prev);
			else this.onEscape();
		} else {
			// Grid mode
			if (this.isInFirstRow(target)) {
				this.onEscape();
			} else {
				const above = this.findAbove(target);
				if (above) this.focusItem(above);
			}
		}
	}

	private handleDown(target: HTMLElement, e: KeyboardEvent): void {
		if (this.mode === 'row') return;
		e.preventDefault();
		if (this.mode === 'column') {
			const next = this.findNext(target);
			if (next) this.focusItem(next);
		} else {
			const below = this.findBelow(target);
			if (below) this.focusItem(below);
		}
	}

	private handleLeft(target: HTMLElement, e: KeyboardEvent): void {
		if (this.mode === 'column') return;
		e.preventDefault();
		const prev = this.findPrevious(target);
		if (prev) this.focusItem(prev);
	}

	private handleRight(target: HTMLElement, e: KeyboardEvent): void {
		if (this.mode === 'column') return;
		e.preventDefault();
		const next = this.findNext(target);
		if (next) this.focusItem(next);
	}
}
