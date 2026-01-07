<style lang="scss">
    @use "@reguitzell/styles" as rz;

    :global(.parameter-items > * + *) {
        margin-left: rz.size(sm);
    }

    .paren {
        color: var(--text-subtle-color);
    }
</style>

<span class="parameters">
    <span class="paren">(</span>
    <span class="parameter-items">
        <slot/>
    </span>
    <span class="paren">)</span>
</span>