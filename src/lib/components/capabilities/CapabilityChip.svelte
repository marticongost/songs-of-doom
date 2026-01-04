<script lang="ts">
    import type { Capability } from "$lib/catalog/models/capability";
    import { standardAttributes } from "../standardattributes";

    export let capability: Capability;
</script>

<div {...standardAttributes($$props, "capability-chip")}>
</div>