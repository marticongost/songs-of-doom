<script lang="ts" module>
	export class TreeContext<T> {
		readonly parent?: TreeContext<T>;
		readonly item: T;
		readonly index: number;
		readonly children: TreeContext<T>[];

		constructor(parentContext: TreeContext<T> | undefined, item: T, index: number) {
			this.parent = parentContext;
			this.item = item;
			this.index = index;
			this.children = [];
		}

		get depth(): number {
			let depth = 0;
			let context = this.parent;
			while (context) {
				depth++;
				context = context.parent;
			}
			return depth;
		}

		get parents(): T[] {
			const parents: T[] = [];
			let context = this.parent;
			while (context) {
				parents.push(context.item);
				context = context.parent;
			}
			parents.reverse();
			return parents;
		}

		get isLast(): boolean {
			return !this.parent || this.index === this.parent.children.length - 1;
		}

		get key(): string {
			return `${this.parents.map((parent) => String(parent)).join('/')}/${String(this.index)}`;
		}

		child(child: T): TreeContext<T> {
			const childContext = new TreeContext(this, child, this.children.length);
			this.children.push(childContext);
			return childContext;
		}
	}
</script>

<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		root: T;
		getChildren: (context: TreeContext<T>) => T[];
		getItemKey?: (context: TreeContext<T>) => string;
		itemSnippet: Snippet<[TreeContext<T>]>;
		appearence?: 'bullets' | 'arrows';
	}

	let {
		root,
		getChildren,
		getItemKey = (context: TreeContext<T>) => context.key,
		itemSnippet,
		appearence = 'bullets',
		...rest
	}: Props = $props();
</script>

{#snippet itemList(context: TreeContext<T>)}
	{@const children = getChildren(context)}
	{#if children.length}
		{@const childContexts = children.map((child) => context.child(child))}
		<ul class="item-list" data-depth={context.depth}>
			{#each childContexts as childContext (getItemKey(childContext))}
				<li class="item-list-entry" data-depth={childContext.depth}>
					{#if appearence === 'arrows'}
						{#if childContext.depth > 1}
							<InlineSvg src="arrow-tip.svg" class="connector-arrow" />
							<div class="connector-v"></div>
							<div class="connector-h"></div>
						{/if}
					{/if}
					{@render itemSnippet(childContext)}
					{@render itemList(childContext)}
				</li>
			{/each}
		</ul>
	{/if}
{/snippet}

<div {...standardAttributes(rest, 'tree')} data-appearence={appearence}>
	{@render itemList(new TreeContext<T>(undefined, root, 0))}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	@function item-spacing() {
		@return var(--item-spacing, #{rz.size(xs)});
	}

	@function connector-indent() {
		@return var(--connector-indent, #{rz.size(xs)});
	}

	@function arrow-width() {
		@return var(--arrow-width, #{rz.size(sm)});
	}

	@function arrow-height() {
		@return var(--arrow-height, #{rz.size(sm)});
	}

	@function item-indent() {
		@return var(--item-indent, #{rz.size(xs)});
	}

	@function connector-width() {
		@return var(--connector-width, #{item-spacing()});
	}

	@function connector-vertical-offset() {
		@return var(--connector-vertical-offset, #{rz.size(sm)});
	}

	@function connector-thickness() {
		@return var(--connector-thickness, 2px);
	}

	@function connector-color() {
		@return var(--connector-color, var(--text-subtle-color));
	}

	@function list-vpadding() {
		@return var(--list-vpadding, #{rz.size(xs)});
	}

	.tree[data-appearence='bullets'] {
		.item-list {
			list-style-type: disc;
			margin-left: rz.size(md);
		}
	}

	.tree[data-appearence='arrows'] {
		.item-list {
			list-style: none;
			padding: #{list-vpadding()} 0;
		}

		.item-list-entry:not([data-depth='1']) {
			padding-top: item-spacing();
			position: relative;
			padding-left: calc(
				#{connector-indent()} + #{connector-thickness()} + #{connector-width()} + #{arrow-width()} +
					#{item-indent()}
			);

			&:last-child :global(.connector-v) {
				height: calc(
					#{item-spacing()} + #{connector-vertical-offset()} + #{connector-thickness()} / 2
				);
			}

			&:not(:last-child) :global(.connector-v) {
				height: 100%;
			}
		}

		:global(.connector-arrow) {
			color: connector-color();
			position: absolute;
			left: calc(#{connector-indent()} + #{connector-thickness()} + #{connector-width()});
			top: calc(#{item-spacing()} + #{connector-vertical-offset()} - #{arrow-height()} / 2);
			width: arrow-width();
			height: arrow-height();
		}

		:global(.connector-v) {
			position: absolute;
			top: 0;
			left: connector-indent();
			width: connector-thickness();
			background-color: connector-color();
		}

		:global(.connector-h) {
			position: absolute;
			top: calc(#{item-spacing()} + #{connector-vertical-offset()} - #{connector-thickness()} / 2);
			left: calc(#{connector-indent()} + #{connector-thickness()});
			width: calc(#{connector-width()} + #{arrow-width()} / 2);
			height: connector-thickness();
			background-color: connector-color();
		}
	}
</style>
