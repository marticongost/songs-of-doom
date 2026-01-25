---
name: create-svelte-component
description: Create or update Svelte components following the project's conventions.
---

# Svelte components

This skill describes conventions used when declaring new Svelte components or modifying
existing ones.

## Component name

If the user has not provide a name for the component explicitly, choose a suitable one
based on the general description of what the component is meant to do. If neither was
provided, ask for clarification.

Conventions:

- Use names in PascalCase with a .svelte extension
- Lists of items should have a `List` suffix (e.g. GizmoList)
- Displays for a single unit of information (e.g. a value or entity) are frequently
  suffixed as `Chip` (e.g. GizmoChip)

## Location

Place components in `lib/components` by default. The user may request a subfolder, to
group related components together (e.g. `lib/gizmo/GizmoList.svelte`,
`lib/gizmo/GizmoChip.svelte`).

## Svelte version

Use Svelte 5, including runes and snippets. Refrain from using deprecated features from
older versions.

## Tag

Unless otherwise specified, default to `<div>` as the root tag.

## Properties

By convention, declare a `Props` interface with the properties supported by the
component. Make it extend from `StandardAttributeProps` and use it in conjunction with
the `standardAttributes` function to allow the component's standard HTML attributes to
be extended (e.g. add additional CSS classes, set data-_ or aria-_ attributes, etc).

## Styles

Use SCSS for all styles (i.e. `<script lang="scss"></script>). Styles use the
`@reguitzell/styles`library. By convention, it is imported as`rz`, for convenience.

Refrain from attempting to define styles on your own.

IF the user requests aid with creating or modifying styles for the component, follow
these rules.

- Take care of using the `rz.row` and `rz.column` mixins instead of explicitly assigning
  flex displays
- Use the defined grid sizes (xs, sm, md, lg, xl) wherever possible:
  - Set paddings using `rz.padding`, `rz.hpadding`, `rz.vpadding`
    ✅ `@include rz.padding(sm)`)
    ❌ `padding: 1em`
  - Same for margins, with `rz.margin`, `rz.hmargin` and `rz.vmargin`
  - To create rows, columns and grids with gaps, using `rz.row`,`rz.column` and
    `rz.grid`, respectively (e.g. `@include rz.row(md)`)
  - On arbitrary CSS properties, using `rz.size` (e.g. `top: rz.size(lg)`)

## Imports

Use absolute imports, take advantage of the `$lib` alias.

## Template

When creating a new component, use the provided `NewComponentTemplate.svelte` template
file.
