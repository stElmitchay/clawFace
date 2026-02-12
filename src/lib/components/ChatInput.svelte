<script lang="ts">
	import { isLoading, stopGeneration } from '$lib/stores/chat.svelte';

	interface Props {
		onSend: (message: string) => void;
	}

	let { onSend }: Props = $props();
	let input = $state('');
	let textarea: HTMLTextAreaElement;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	function send() {
		const text = input.trim();
		if (!text || isLoading()) return;
		onSend(text);
		input = '';
		if (textarea) {
			textarea.style.height = 'auto';
		}
	}

	function autoResize() {
		if (!textarea) return;
		textarea.style.height = 'auto';
		textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
	}
</script>

<div class="input-area">
	<div class="input-wrapper">
		<textarea
			bind:this={textarea}
			bind:value={input}
			oninput={autoResize}
			onkeydown={handleKeydown}
			placeholder="Message OpenClaw..."
			rows="1"
			disabled={isLoading()}
		></textarea>
		{#if isLoading()}
			<button class="stop-btn" onclick={stopGeneration} title="Stop generating">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<rect x="3" y="3" width="10" height="10" rx="2" />
				</svg>
			</button>
		{:else}
			<button class="send-btn" onclick={send} disabled={!input.trim()} title="Send message">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M2.5 1.75a.75.75 0 0 1 1.06-.02l5.47 5.25a.75.75 0 0 1 0 1.04l-5.47 5.25a.75.75 0 0 1-1.04-1.08L7.3 8 2.52 3.83a.75.75 0 0 1-.02-1.06z" />
				</svg>
			</button>
		{/if}
	</div>
</div>

<style>
	.input-area {
		padding: 12px 16px 16px;
		border-top: 1px solid var(--border-color, #d1d1d6);
		background: var(--bg-primary, #ffffff);
	}

	.input-wrapper {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		background: var(--input-bg, #f2f2f7);
		border-radius: 20px;
		padding: 8px 8px 8px 16px;
	}

	textarea {
		flex: 1;
		border: none;
		background: none;
		resize: none;
		font-family: inherit;
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-primary, #1c1c1e);
		outline: none;
		padding: 2px 0;
		max-height: 150px;
	}

	textarea::placeholder {
		color: var(--text-tertiary, #c7c7cc);
	}

	.send-btn,
	.stop-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: opacity 0.15s;
	}

	.send-btn {
		background: #007aff;
		color: white;
	}

	.send-btn:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.stop-btn {
		background: #ff3b30;
		color: white;
	}
</style>
