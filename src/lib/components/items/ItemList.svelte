<script lang="ts">
  import type { Item } from "$lib/catalog/models/inventory";
  import type { Component } from "svelte";
  import ItemCard from "./ItemCard.svelte";

  export let items: Item[];

  // Only constrain props; let Svelte handle the rest
  export let ItemComponent: Component<{ item: Item }> = ItemCard;
</script>

{#each items as item}
  <svelte:component this={ItemComponent} {item} />
{/each}
