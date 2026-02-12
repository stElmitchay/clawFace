<script lang="ts">
	import { getSettings, updateSettings } from '$lib/stores/settings.svelte';
	import { checkConnection } from '$lib/api/openclaw';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();
	let settings = $derived(getSettings());
	let testResult = $state<'idle' | 'testing' | 'success' | 'fail'>('idle');

	function handleUrlChange(e: Event) {
		updateSettings({ gatewayUrl: (e.target as HTMLInputElement).value });
	}

	function handleModelChange(e: Event) {
		updateSettings({ model: (e.target as HTMLInputElement).value });
	}

	function handleAgentIdChange(e: Event) {
		updateSettings({ agentId: (e.target as HTMLInputElement).value });
	}

	function handleTokenChange(e: Event) {
		updateSettings({ token: (e.target as HTMLInputElement).value });
	}

	function handleThemeChange(e: Event) {
		updateSettings({ theme: (e.target as HTMLSelectElement).value as 'system' | 'light' | 'dark' });
	}

	async function testConnection() {
		testResult = 'testing';
		const ok = await checkConnection(settings.gatewayUrl, settings.token);
		testResult = ok ? 'success' : 'fail';
		setTimeout(() => (testResult = 'idle'), 3000);
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="backdrop" onclick={handleBackdropClick}>
	<div class="panel" role="dialog" aria-label="Settings">
		<div class="panel-header">
			<h2>Settings</h2>
			<button class="close-btn" onclick={onClose}>&times;</button>
		</div>

		<div class="field">
			<label for="gateway-url">Gateway URL</label>
			<input
				id="gateway-url"
				type="url"
				value={settings.gatewayUrl}
				oninput={handleUrlChange}
				placeholder="http://localhost:18789"
			/>
		</div>

		<div class="field">
			<label for="model">Model</label>
			<input
				id="model"
				type="text"
				value={settings.model}
				oninput={handleModelChange}
				placeholder="openclaw"
			/>
		</div>

		<div class="field">
			<label for="agent-id">Agent ID</label>
			<input
				id="agent-id"
				type="text"
				value={settings.agentId}
				oninput={handleAgentIdChange}
				placeholder="main"
			/>
		</div>

		<div class="field">
			<label for="token">Gateway Auth Token</label>
			<input
				id="token"
				type="password"
				value={settings.token}
				oninput={handleTokenChange}
				placeholder="Required — see ~/.openclaw/credentials/"
			/>
		</div>

		<div class="field">
			<label for="theme">Theme</label>
			<select id="theme" value={settings.theme} onchange={handleThemeChange}>
				<option value="system">System</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</div>

		<button class="test-btn" onclick={testConnection} disabled={testResult === 'testing'}>
			{#if testResult === 'testing'}
				Testing...
			{:else if testResult === 'success'}
				Connected!
			{:else if testResult === 'fail'}
				Connection Failed
			{:else}
				Test Connection
			{/if}
		</button>
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		backdrop-filter: blur(4px);
	}

	.panel {
		background: var(--bg-primary, #ffffff);
		border-radius: 12px;
		padding: 24px;
		width: 380px;
		max-width: 90vw;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 22px;
		cursor: pointer;
		color: var(--text-secondary, #8e8e93);
		padding: 0 4px;
		line-height: 1;
	}

	.field {
		margin-bottom: 16px;
	}

	label {
		display: block;
		font-size: 13px;
		font-weight: 500;
		margin-bottom: 6px;
		color: var(--text-secondary, #8e8e93);
	}

	input,
	select {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid var(--border-color, #d1d1d6);
		border-radius: 8px;
		font-size: 14px;
		background: var(--input-bg, #f2f2f7);
		color: var(--text-primary, #1c1c1e);
		outline: none;
		box-sizing: border-box;
	}

	input:focus,
	select:focus {
		border-color: #007aff;
		box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
	}

	.test-btn {
		width: 100%;
		padding: 10px;
		border: none;
		border-radius: 8px;
		background: #007aff;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		margin-top: 4px;
	}

	.test-btn:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
