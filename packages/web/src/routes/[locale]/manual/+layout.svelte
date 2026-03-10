<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		manual: {
			h1: {
				fontFamily: css.fonts.heading,
				fontSize: '2.5rem',
				marginBottom: '1rem'
			}
		}
	});
</script>

<script lang="ts">
	const { children } = $props();
</script>

<div class={styles.manual}>
	{@render children()}
</div>
