<script lang="ts">
	import '../app.css';
	import { getSettings } from '$lib/stores/settings.svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	$effect(() => {
		if (!browser) return;
		const theme = getSettings().theme;
		if (theme === 'system') {
			document.documentElement.removeAttribute('data-theme');
		} else {
			document.documentElement.setAttribute('data-theme', theme);
		}
	});
</script>

<div class="app-shell">
	<div class="drag-region" data-tauri-drag-region></div>
	{@render children()}
</div>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	.drag-region {
		height: 28px;
		flex-shrink: 0;
		-webkit-app-region: drag;
	}
</style>
