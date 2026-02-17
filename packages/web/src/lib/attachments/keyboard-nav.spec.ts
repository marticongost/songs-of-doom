/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { KeyboardNavigation } from './keyboard-nav';

function mockElementRect(
	element: HTMLElement,
	top: number,
	left: number,
	width: number,
	height: number
): void {
	const rect = {
		top,
		left,
		bottom: top + height,
		right: left + width,
		width,
		height,
		x: left,
		y: top,
		toJSON: () => ({})
	} as DOMRect;

	element.getBoundingClientRect = () => rect;
	element.getClientRects = () =>
		[
			{
				...rect,
				toJSON: () => ({})
			}
		] as unknown as DOMRectList;
}

/**
 * Helper to create a mock DOM structure for testing.
 * Creates a container with items positioned in a grid layout.
 */
function createMockGrid(
	rows: number,
	cols: number
): { container: HTMLElement; items: HTMLElement[] } {
	const container = document.createElement('div');
	const items: HTMLElement[] = [];
	const itemWidth = 100;
	const itemHeight = 50;

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const item = document.createElement('a');
			item.setAttribute('href', '#');
			item.textContent = `Item ${row * cols + col}`;
			mockElementRect(item, row * itemHeight, col * itemWidth, itemWidth, itemHeight);
			container.appendChild(item);
			items.push(item);
		}
	}

	document.body.appendChild(container);
	return { container, items };
}

/**
 * Helper to attach the navigation to a container.
 */
function attachNavigation(nav: KeyboardNavigation, container: HTMLElement): () => void {
	const cleanup = nav.resultsAttachment()(container);
	return cleanup ?? (() => {});
}

describe('KeyboardNavigation', () => {
	let cleanup: (() => void) | null = null;
	let container: HTMLElement | null = null;

	afterEach(() => {
		cleanup?.();
		cleanup = null;
		container?.remove();
		container = null;
	});

	describe('constructor', () => {
		it('uses default item selector when not provided', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(1, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.getItems()).toEqual(items);
		});

		it('uses custom item selector when provided', () => {
			const nav = new KeyboardNavigation({ mode: 'grid', itemSelector: '.custom-item' });
			const c = document.createElement('div');
			const custom1 = document.createElement('div');
			custom1.className = 'custom-item';
			mockElementRect(custom1, 0, 0, 100, 50);
			const custom2 = document.createElement('div');
			custom2.className = 'custom-item';
			mockElementRect(custom2, 0, 100, 100, 50);
			const other = document.createElement('a');
			c.append(custom1, custom2, other);
			document.body.appendChild(c);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.getItems()).toEqual([custom1, custom2]);
		});
	});

	describe('getItems', () => {
		it('returns empty array when no container attached', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			expect(nav.getItems()).toEqual([]);
		});

		it('returns all matching items in the container', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(2, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.getItems()).toHaveLength(6);
			expect(nav.getItems()).toEqual(items);
		});

		it('filters out hidden, disabled, and aria-hidden elements', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const c = document.createElement('div');

			const visible = document.createElement('button');
			visible.textContent = 'visible';
			mockElementRect(visible, 0, 0, 100, 50);

			const hidden = document.createElement('button');
			hidden.textContent = 'hidden';
			hidden.style.display = 'none';
			mockElementRect(hidden, 0, 100, 100, 50);

			const ariaHidden = document.createElement('button');
			ariaHidden.textContent = 'aria-hidden';
			ariaHidden.setAttribute('aria-hidden', 'true');
			mockElementRect(ariaHidden, 0, 200, 100, 50);

			const disabled = document.createElement('button');
			disabled.textContent = 'disabled';
			disabled.disabled = true;
			mockElementRect(disabled, 0, 300, 100, 50);

			c.append(visible, hidden, ariaHidden, disabled);
			document.body.appendChild(c);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.getItems()).toEqual([visible]);
		});
	});

	describe('findFirst', () => {
		it('returns null when no items', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const c = document.createElement('div');
			document.body.appendChild(c);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findFirst()).toBeNull();
		});

		it('returns the first item', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(2, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findFirst()).toBe(items[0]);
		});
	});

	describe('findLast', () => {
		it('returns null when no items', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const c = document.createElement('div');
			document.body.appendChild(c);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findLast()).toBeNull();
		});

		it('returns the last item', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(2, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findLast()).toBe(items[5]);
		});
	});

	describe('findNext', () => {
		it('returns the next item in array order', () => {
			const nav = new KeyboardNavigation({ mode: 'row' });
			const { container: c, items } = createMockGrid(1, 4);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findNext(items[0])).toBe(items[1]);
			expect(nav.findNext(items[1])).toBe(items[2]);
			expect(nav.findNext(items[2])).toBe(items[3]);
		});

		it('returns null for the last item', () => {
			const nav = new KeyboardNavigation({ mode: 'row' });
			const { container: c, items } = createMockGrid(1, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findNext(items[2])).toBeNull();
		});

		it('returns first item for an element not in the list', () => {
			// Note: When indexOf returns -1, index + 1 = 0 returns first item
			const nav = new KeyboardNavigation({ mode: 'row' });
			const { container: c, items } = createMockGrid(1, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			const outsideItem = document.createElement('a');
			expect(nav.findNext(outsideItem)).toBe(items[0]);
		});
	});

	describe('findPrevious', () => {
		it('returns the previous item in array order', () => {
			const nav = new KeyboardNavigation({ mode: 'row' });
			const { container: c, items } = createMockGrid(1, 4);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findPrevious(items[3])).toBe(items[2]);
			expect(nav.findPrevious(items[2])).toBe(items[1]);
			expect(nav.findPrevious(items[1])).toBe(items[0]);
		});

		it('returns null for the first item', () => {
			const nav = new KeyboardNavigation({ mode: 'row' });
			const { container: c, items } = createMockGrid(1, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findPrevious(items[0])).toBeNull();
		});
	});

	describe('findAbove', () => {
		it('returns the item directly above in a grid', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			// 3x3 grid: indices 0-2 (row 0), 3-5 (row 1), 6-8 (row 2)
			const { container: c, items } = createMockGrid(3, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findAbove(items[4])).toBe(items[1]); // center -> above center
			expect(nav.findAbove(items[7])).toBe(items[4]); // bottom center -> center
		});

		it('returns null for items in the first row', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(3, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findAbove(items[0])).toBeNull();
			expect(nav.findAbove(items[1])).toBeNull();
			expect(nav.findAbove(items[2])).toBeNull();
		});

		it('prefers items closest horizontally when multiple items are above', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(2, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			// Item at index 3 (row 1, col 0) should find item at index 0 (row 0, col 0)
			expect(nav.findAbove(items[3])).toBe(items[0]);
			// Item at index 5 (row 1, col 2) should find item at index 2 (row 0, col 2)
			expect(nav.findAbove(items[5])).toBe(items[2]);
		});
	});

	describe('findBelow', () => {
		it('returns the item directly below in a grid', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(3, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findBelow(items[1])).toBe(items[4]); // top center -> center
			expect(nav.findBelow(items[4])).toBe(items[7]); // center -> bottom center
		});

		it('returns null for items in the last row', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(3, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findBelow(items[6])).toBeNull();
			expect(nav.findBelow(items[7])).toBeNull();
			expect(nav.findBelow(items[8])).toBeNull();
		});

		it('prefers items closest horizontally when multiple items are below', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(2, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.findBelow(items[0])).toBe(items[3]);
			expect(nav.findBelow(items[2])).toBe(items[5]);
		});
	});

	describe('isInFirstRow', () => {
		it('returns true for items in the first row', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(3, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.isInFirstRow(items[0])).toBe(true);
			expect(nav.isInFirstRow(items[1])).toBe(true);
			expect(nav.isInFirstRow(items[2])).toBe(true);
		});

		it('returns false for items not in the first row', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(3, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			expect(nav.isInFirstRow(items[3])).toBe(false);
			expect(nav.isInFirstRow(items[4])).toBe(false);
			expect(nav.isInFirstRow(items[8])).toBe(false);
		});

		it('returns false when container is empty', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const c = document.createElement('div');
			document.body.appendChild(c);
			container = c;
			cleanup = attachNavigation(nav, c);

			const orphanItem = document.createElement('a');
			expect(nav.isInFirstRow(orphanItem)).toBe(false);
		});
	});

	describe('focusItem', () => {
		it('focuses the specified item', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(2, 2);
			container = c;
			cleanup = attachNavigation(nav, c);

			nav.focusItem(items[2]);

			expect(document.activeElement).toBe(items[2]);
		});

		it('sets focused item tabindex to 0 and others to -1', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(1, 3);
			container = c;
			cleanup = attachNavigation(nav, c);

			nav.focusItem(items[1]);

			expect(items[0].tabIndex).toBe(-1);
			expect(items[1].tabIndex).toBe(0);
			expect(items[2].tabIndex).toBe(-1);
		});

		it('sets ARIA attributes on first focus', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(1, 2);
			container = c;
			cleanup = attachNavigation(nav, c);

			// Before focusing, no ARIA attributes
			expect(c.getAttribute('role')).toBeNull();

			nav.focusItem(items[0]);

			expect(c.getAttribute('role')).toBe('grid');
			expect(items[0].getAttribute('role')).toBe('gridcell');
			expect(items[1].getAttribute('role')).toBe('gridcell');
		});

		it('sets listbox role for row mode', () => {
			const nav = new KeyboardNavigation({ mode: 'row' });
			const { container: c, items } = createMockGrid(1, 2);
			container = c;
			cleanup = attachNavigation(nav, c);

			nav.focusItem(items[0]);

			expect(c.getAttribute('role')).toBe('listbox');
			expect(items[0].getAttribute('role')).toBe('option');
		});

		it('sets listbox role for column mode', () => {
			const nav = new KeyboardNavigation({ mode: 'column' });
			const { container: c, items } = createMockGrid(2, 1);
			container = c;
			cleanup = attachNavigation(nav, c);

			nav.focusItem(items[0]);

			expect(c.getAttribute('role')).toBe('listbox');
			expect(items[0].getAttribute('role')).toBe('option');
		});
	});

	describe('focusFirst', () => {
		it('focuses the first item', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(2, 2);
			container = c;
			cleanup = attachNavigation(nav, c);

			nav.focusFirst();

			expect(document.activeElement).toBe(items[0]);
		});

		it('does nothing when container is empty', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const c = document.createElement('div');
			document.body.appendChild(c);
			container = c;
			cleanup = attachNavigation(nav, c);

			// Should not throw
			nav.focusFirst();
			expect(document.activeElement).not.toBe(c);
		});
	});

	describe('focusLast', () => {
		it('focuses the last item', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(2, 2);
			container = c;
			cleanup = attachNavigation(nav, c);

			nav.focusLast();

			expect(document.activeElement).toBe(items[3]);
		});
	});

	describe('keyboard handling', () => {
		function dispatchKeydown(element: HTMLElement, key: string): KeyboardEvent {
			const event = new KeyboardEvent('keydown', {
				key,
				bubbles: true,
				cancelable: true
			});
			element.dispatchEvent(event);
			return event;
		}

		describe('row mode', () => {
			it('ArrowRight moves to next item', () => {
				const nav = new KeyboardNavigation({ mode: 'row' });
				const { container: c, items } = createMockGrid(1, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[0]);

				dispatchKeydown(items[0], 'ArrowRight');

				expect(document.activeElement).toBe(items[1]);
			});

			it('ArrowLeft moves to previous item', () => {
				const nav = new KeyboardNavigation({ mode: 'row' });
				const { container: c, items } = createMockGrid(1, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[2]);

				dispatchKeydown(items[2], 'ArrowLeft');

				expect(document.activeElement).toBe(items[1]);
			});

			it('ArrowUp does nothing in row mode', () => {
				const nav = new KeyboardNavigation({ mode: 'row' });
				const { container: c, items } = createMockGrid(1, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[1]);

				dispatchKeydown(items[1], 'ArrowUp');

				expect(document.activeElement).toBe(items[1]);
			});

			it('ArrowDown does nothing in row mode', () => {
				const nav = new KeyboardNavigation({ mode: 'row' });
				const { container: c, items } = createMockGrid(1, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[1]);

				dispatchKeydown(items[1], 'ArrowDown');

				expect(document.activeElement).toBe(items[1]);
			});
		});

		describe('column mode', () => {
			it('ArrowDown moves to next item', () => {
				const nav = new KeyboardNavigation({ mode: 'column' });
				const { container: c, items } = createMockGrid(3, 1);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[0]);

				dispatchKeydown(items[0], 'ArrowDown');

				expect(document.activeElement).toBe(items[1]);
			});

			it('ArrowUp moves to previous item', () => {
				const nav = new KeyboardNavigation({ mode: 'column' });
				const { container: c, items } = createMockGrid(3, 1);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[2]);

				dispatchKeydown(items[2], 'ArrowUp');

				expect(document.activeElement).toBe(items[1]);
			});

			it('ArrowLeft does nothing in column mode', () => {
				const nav = new KeyboardNavigation({ mode: 'column' });
				const { container: c, items } = createMockGrid(3, 1);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[1]);

				dispatchKeydown(items[1], 'ArrowLeft');

				expect(document.activeElement).toBe(items[1]);
			});

			it('ArrowRight does nothing in column mode', () => {
				const nav = new KeyboardNavigation({ mode: 'column' });
				const { container: c, items } = createMockGrid(3, 1);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[1]);

				dispatchKeydown(items[1], 'ArrowRight');

				expect(document.activeElement).toBe(items[1]);
			});

			it('ArrowUp on first item calls onEscape', () => {
				const onEscape = vi.fn();
				const nav = new KeyboardNavigation({ mode: 'column', onEscape });
				const { container: c, items } = createMockGrid(3, 1);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[0]);

				dispatchKeydown(items[0], 'ArrowUp');

				expect(onEscape).toHaveBeenCalledOnce();
			});
		});

		describe('grid mode', () => {
			it('ArrowRight moves to next item', () => {
				const nav = new KeyboardNavigation({ mode: 'grid' });
				const { container: c, items } = createMockGrid(2, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[0]);

				dispatchKeydown(items[0], 'ArrowRight');

				expect(document.activeElement).toBe(items[1]);
			});

			it('ArrowLeft moves to previous item', () => {
				const nav = new KeyboardNavigation({ mode: 'grid' });
				const { container: c, items } = createMockGrid(2, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[1]);

				dispatchKeydown(items[1], 'ArrowLeft');

				expect(document.activeElement).toBe(items[0]);
			});

			it('ArrowDown moves to item below', () => {
				const nav = new KeyboardNavigation({ mode: 'grid' });
				const { container: c, items } = createMockGrid(2, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[1]);

				dispatchKeydown(items[1], 'ArrowDown');

				expect(document.activeElement).toBe(items[4]);
			});

			it('ArrowUp moves to item above', () => {
				const nav = new KeyboardNavigation({ mode: 'grid' });
				const { container: c, items } = createMockGrid(2, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[4]);

				dispatchKeydown(items[4], 'ArrowUp');

				expect(document.activeElement).toBe(items[1]);
			});

			it('ArrowUp on first row calls onEscape', () => {
				const onEscape = vi.fn();
				const nav = new KeyboardNavigation({ mode: 'grid', onEscape });
				const { container: c, items } = createMockGrid(2, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[1]);

				dispatchKeydown(items[1], 'ArrowUp');

				expect(onEscape).toHaveBeenCalledOnce();
			});
		});

		describe('common keys', () => {
			it('Home focuses first item', () => {
				const nav = new KeyboardNavigation({ mode: 'grid' });
				const { container: c, items } = createMockGrid(2, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[4]);

				dispatchKeydown(items[4], 'Home');

				expect(document.activeElement).toBe(items[0]);
			});

			it('End focuses last item', () => {
				const nav = new KeyboardNavigation({ mode: 'grid' });
				const { container: c, items } = createMockGrid(2, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[1]);

				dispatchKeydown(items[1], 'End');

				expect(document.activeElement).toBe(items[5]);
			});

			it('Escape calls onEscape callback', () => {
				const onEscape = vi.fn();
				const nav = new KeyboardNavigation({ mode: 'grid', onEscape });
				const { container: c, items } = createMockGrid(2, 3);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[1]);

				dispatchKeydown(items[1], 'Escape');

				expect(onEscape).toHaveBeenCalledOnce();
			});

			it('Escape focuses search input when no custom handler', () => {
				const nav = new KeyboardNavigation({ mode: 'grid' });
				const { container: c, items } = createMockGrid(2, 3);
				container = c;
				cleanup = attachNavigation(nav, c);

				// Create and attach search input
				const searchInput = document.createElement('input');
				document.body.appendChild(searchInput);
				const searchCleanup = nav.searchInputAttachment()(searchInput);

				nav.focusItem(items[1]);
				dispatchKeydown(items[1], 'Escape');

				expect(document.activeElement).toBe(searchInput);

				searchCleanup?.();
				searchInput.remove();
			});

			it('ignores keydown events on elements not in the item list', () => {
				const nav = new KeyboardNavigation({ mode: 'grid' });
				const { container: c, items } = createMockGrid(2, 2);
				container = c;
				cleanup = attachNavigation(nav, c);
				nav.focusItem(items[0]);

				// Create an element inside the container that's not an item
				const outsideElement = document.createElement('span');
				c.appendChild(outsideElement);

				// Dispatch event on the outside element
				const event = new KeyboardEvent('keydown', {
					key: 'ArrowRight',
					bubbles: true,
					cancelable: true
				});
				outsideElement.dispatchEvent(event);

				// Focus should not have changed
				expect(document.activeElement).toBe(items[0]);
			});

			it('handles keydown events bubbling from descendants', () => {
				const nav = new KeyboardNavigation({ mode: 'row' });
				const { container: c, items } = createMockGrid(1, 3);
				container = c;
				cleanup = attachNavigation(nav, c);

				// Add a child element inside the first item
				const childSpan = document.createElement('span');
				items[0].appendChild(childSpan);

				nav.focusItem(items[0]);

				// Dispatch event from the child span (bubbles up to item)
				const event = new KeyboardEvent('keydown', {
					key: 'ArrowRight',
					bubbles: true,
					cancelable: true
				});
				childSpan.dispatchEvent(event);

				expect(document.activeElement).toBe(items[1]);
			});
		});
	});

	describe('searchInputAttachment', () => {
		it('attaches to input elements directly', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(1, 2);
			container = c;
			cleanup = attachNavigation(nav, c);

			const input = document.createElement('input');
			document.body.appendChild(input);
			const inputCleanup = nav.searchInputAttachment()(input);

			input.focus();
			input.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
			);

			expect(document.activeElement).toBe(items[0]);

			inputCleanup?.();
			input.remove();
		});

		it('finds input inside wrapper elements', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(1, 2);
			container = c;
			cleanup = attachNavigation(nav, c);

			const wrapper = document.createElement('div');
			const input = document.createElement('input');
			wrapper.appendChild(input);
			document.body.appendChild(wrapper);
			const wrapperCleanup = nav.searchInputAttachment()(wrapper);

			input.focus();
			input.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
			);

			expect(document.activeElement).toBe(items[0]);

			wrapperCleanup?.();
			wrapper.remove();
		});

		it('Tab does not focus results (allows native tab behavior)', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c } = createMockGrid(1, 2);
			container = c;
			cleanup = attachNavigation(nav, c);

			const input = document.createElement('input');
			document.body.appendChild(input);
			const inputCleanup = nav.searchInputAttachment()(input);

			input.focus();
			const event = new KeyboardEvent('keydown', {
				key: 'Tab',
				bubbles: true,
				cancelable: true
			});
			input.dispatchEvent(event);

			// Tab should not be intercepted - focus stays on input (native behavior takes over)
			expect(document.activeElement).toBe(input);

			inputCleanup?.();
			input.remove();
		});

		it('does nothing when no input found in wrapper', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });

			const wrapper = document.createElement('div');
			wrapper.appendChild(document.createElement('span'));
			document.body.appendChild(wrapper);

			// Should return undefined/void and not throw
			const result = nav.searchInputAttachment()(wrapper);
			expect(result).toBeUndefined();

			wrapper.remove();
		});
	});

	describe('resultsAttachment cleanup', () => {
		it('removes event listener on cleanup', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c, items } = createMockGrid(1, 3);
			container = c;
			const attachmentCleanup = attachNavigation(nav, c);
			nav.focusItem(items[0]);

			// Cleanup the attachment
			attachmentCleanup();

			// Now keydown should not work
			items[0].dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
			);

			// Focus should not have moved
			expect(document.activeElement).toBe(items[0]);
		});

		it('returns empty items array after cleanup', () => {
			const nav = new KeyboardNavigation({ mode: 'grid' });
			const { container: c } = createMockGrid(1, 3);
			container = c;
			const attachmentCleanup = attachNavigation(nav, c);

			attachmentCleanup();

			expect(nav.getItems()).toEqual([]);
		});
	});
});
