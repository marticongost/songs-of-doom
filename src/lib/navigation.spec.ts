import { describe, expect, it } from 'vitest';
import { Section } from './navigation';

describe('Section', () => {
	describe('path', () => {
		it('returns path with leading slash for root section', () => {
			const section = new Section({ title: { en: 'Home' }, name: 'home' });
			expect(section.path).toBe('/home');
		});

		it('returns full path for nested section', () => {
			const root = new Section({
				title: { en: 'Root' },
				name: 'root',
				children: [{ title: { en: 'Child' }, name: 'child' }]
			});
			expect(root.children[0].path).toBe('/root/child');
		});

		it('returns full path for deeply nested section', () => {
			const root = new Section({
				title: { en: 'Root' },
				name: 'root',
				children: [
					{
						title: { en: 'Child' },
						name: 'child',
						children: [{ title: { en: 'Grandchild' }, name: 'grandchild' }]
					}
				]
			});
			expect(root.children[0].children[0].path).toBe('/root/child/grandchild');
		});

		it('returns "/" for root section with empty name', () => {
			const section = new Section({ title: { en: 'Home' }, name: '' });
			expect(section.path).toBe('/');
		});

		it('returns correct path for child of root with empty name', () => {
			const root = new Section({
				title: { en: 'Home' },
				name: '',
				children: [{ title: { en: 'Cards' }, name: 'cards' }]
			});
			expect(root.path).toBe('/');
			expect(root.children[0].path).toBe('/cards');
		});
	});

	describe('match', () => {
		it('returns "selected" when path matches exactly', () => {
			const section = new Section({ title: { en: 'Home' }, name: 'home' });
			expect(section.match('/home')).toBe('selected');
		});

		it('returns "selected" when path matches with trailing slash', () => {
			const section = new Section({ title: { en: 'Home' }, name: 'home' });
			expect(section.match('/home/')).toBe('selected');
		});

		it('returns "ancestor" when path is a descendant', () => {
			const section = new Section({ title: { en: 'Home' }, name: 'home' });
			expect(section.match('/home/child')).toBe('ancestor');
		});

		it('returns "ancestor" when path is a descendant with trailing slash', () => {
			const section = new Section({ title: { en: 'Home' }, name: 'home' });
			expect(section.match('/home/child/')).toBe('ancestor');
		});

		it('returns "none" when path does not match', () => {
			const section = new Section({ title: { en: 'Home' }, name: 'home' });
			expect(section.match('/other')).toBe('none');
		});

		it('returns "none" when path is a prefix but not a parent', () => {
			const section = new Section({ title: { en: 'Home' }, name: 'home' });
			expect(section.match('/homestead')).toBe('none');
		});

		it('works correctly for nested sections', () => {
			const root = new Section({
				title: { en: 'Root' },
				name: 'root',
				children: [{ title: { en: 'Child' }, name: 'child' }]
			});
			const child = root.children[0];

			expect(child.match('/root/child')).toBe('selected');
			expect(child.match('/root/child/grandchild')).toBe('ancestor');
			expect(child.match('/root')).toBe('none');
			expect(child.match('/root/other')).toBe('none');
		});
	});

	describe('depth', () => {
		it('returns 0 for root section', () => {
			const section = new Section({ title: { en: 'Home' }, name: 'home' });
			expect(section.depth).toBe(0);
		});

		it('returns 1 for direct child', () => {
			const root = new Section({
				title: { en: 'Root' },
				name: 'root',
				children: [{ title: { en: 'Child' }, name: 'child' }]
			});
			expect(root.children[0].depth).toBe(1);
		});

		it('increments for each level of nesting', () => {
			const root = new Section({
				title: { en: 'Root' },
				name: 'root',
				children: [
					{
						title: { en: 'Child' },
						name: 'child',
						children: [{ title: { en: 'Grandchild' }, name: 'grandchild' }]
					}
				]
			});
			expect(root.depth).toBe(0);
			expect(root.children[0].depth).toBe(1);
			expect(root.children[0].children[0].depth).toBe(2);
		});
	});

	describe('getQualifiedName', () => {
		it('returns the name for a root section', () => {
			const section = new Section({ title: { en: 'Home' }, name: 'home' });
			expect(section.getQualifiedName('-')).toBe('home');
		});

		it('returns empty string for a root section with empty name', () => {
			const section = new Section({ title: { en: 'Home' }, name: '' });
			expect(section.getQualifiedName('-')).toBe('');
		});

		it('concatenates names with separator for nested sections', () => {
			const root = new Section({
				title: { en: 'Root' },
				name: 'foo',
				children: [{ title: { en: 'Child' }, name: 'bar' }]
			});
			expect(root.children[0].getQualifiedName('-')).toBe('foo-bar');
		});

		it('skips empty names in the chain', () => {
			const root = new Section({
				title: { en: 'Root' },
				name: '',
				children: [{ title: { en: 'Child' }, name: 'bar' }]
			});
			expect(root.children[0].getQualifiedName('-')).toBe('bar');
		});

		it('works with deeply nested sections', () => {
			const root = new Section({
				title: { en: 'Root' },
				name: 'a',
				children: [
					{
						title: { en: 'Child' },
						name: 'b',
						children: [{ title: { en: 'Grandchild' }, name: 'c' }]
					}
				]
			});
			expect(root.children[0].children[0].getQualifiedName('/')).toBe('a/b/c');
		});

		it('skips empty names in deeply nested sections', () => {
			const root = new Section({
				title: { en: 'Root' },
				name: '',
				children: [
					{
						title: { en: 'Child' },
						name: 'b',
						children: [{ title: { en: 'Grandchild' }, name: '' }]
					}
				]
			});
			expect(root.children[0].children[0].getQualifiedName('-')).toBe('b');
		});
	});

	describe('children', () => {
		it('creates empty children array when none provided', () => {
			const section = new Section({ title: { en: 'Home' }, name: 'home' });
			expect(section.children).toEqual([]);
		});

		it('creates Section instances for children', () => {
			const section = new Section({
				title: { en: 'Root' },
				name: 'root',
				children: [{ title: { en: 'Child' }, name: 'child' }]
			});
			expect(section.children[0]).toBeInstanceOf(Section);
		});

		it('sets parent reference on children', () => {
			const root = new Section({
				title: { en: 'Root' },
				name: 'root',
				children: [{ title: { en: 'Child' }, name: 'child' }]
			});
			expect(root.children[0].parent).toBe(root);
		});
	});
});
