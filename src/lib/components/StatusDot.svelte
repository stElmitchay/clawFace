<script lang="ts">
	import { checkConnection } from '$lib/api/openclaw';
	import { getSettings } from '$lib/stores/settings.svelte';

	let connected = $state(false);
	let checking = $state(false);

	async function check() {
		checking = true;
		const settings = getSettings();
		connected = await checkConnection(settings.gatewayUrl);
		checking = false;
	}

	$effect(() => {
		check();
		const interval = setInterval(check, 10000);
		return () => clearInterval(interval);
	});
</script>

<button class="status-dot-wrapper" onclick={check} title={connected ? 'Connected to Gateway' : 'Gateway disconnected'}>
	<span class="status-dot" class:connected class:checking></span>
</button>

<style>
	.status-dot-wrapper {
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #ef4444;
		transition: background 0.3s;
	}

	.status-dot.connected {
		background: #22c55e;
	}

	.status-dot.checking {
		opacity: 0.5;
	}
</style>
