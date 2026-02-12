<script lang="ts">
	import MessageBubble from '$lib/components/MessageBubble.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import StatusDot from '$lib/components/StatusDot.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import {
		getMessages,
		isLoading,
		getError,
		clearError,
		clearMessages,
		sendMessage
	} from '$lib/stores/chat.svelte';

	let showSettings = $state(false);
	let messagesContainer: HTMLDivElement;

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	$effect(() => {
		// Trigger scroll when messages change
		const msgs = getMessages();
		if (msgs.length > 0) {
			// Use tick to wait for DOM update
			requestAnimationFrame(scrollToBottom);
		}
	});

	function handleSend(text: string) {
		sendMessage(text);
	}
</script>

<div class="chat-page">
	<header class="top-bar">
		<div class="top-bar-left">
			<StatusDot />
			<span class="title">OpenClaw</span>
		</div>
		<div class="top-bar-right">
			{#if getMessages().length > 0}
				<button class="icon-btn" onclick={clearMessages} title="New chat">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 5v14M5 12h14" />
					</svg>
				</button>
			{/if}
			<button class="icon-btn" onclick={() => (showSettings = true)} title="Settings">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="3" />
					<path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
				</svg>
			</button>
		</div>
	</header>

	<div class="messages" bind:this={messagesContainer}>
		{#if getMessages().length === 0}
			<div class="empty-state">
				<div class="empty-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
					</svg>
				</div>
				<p class="empty-title">Start a conversation</p>
				<p class="empty-subtitle">Send a message to begin chatting with OpenClaw</p>
			</div>
		{:else}
			{#each getMessages() as message (message.id)}
				<MessageBubble {message} />
			{/each}
		{/if}
	</div>

	{#if getError()}
		<div class="error-bar">
			<span>{getError()}</span>
			<button onclick={clearError}>&times;</button>
		</div>
	{/if}

	<ChatInput onSend={handleSend} />
</div>

{#if showSettings}
	<Settings onClose={() => (showSettings = false)} />
{/if}

<style>
	.chat-page {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	.top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 16px 8px;
		border-bottom: 1px solid var(--border-color, #d1d1d6);
		flex-shrink: 0;
		-webkit-app-region: drag;
	}

	.top-bar-left {
		display: flex;
		align-items: center;
		gap: 8px;
		-webkit-app-region: no-drag;
	}

	.title {
		font-size: 14px;
		font-weight: 600;
	}

	.top-bar-right {
		display: flex;
		align-items: center;
		gap: 4px;
		-webkit-app-region: no-drag;
	}

	.icon-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px;
		border-radius: 6px;
		color: var(--text-secondary, #8e8e93);
		display: flex;
		align-items: center;
		transition: background 0.15s;
	}

	.icon-btn:hover {
		background: var(--bg-secondary, #f2f2f7);
		color: var(--text-primary, #1c1c1e);
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 16px 0;
		scroll-behavior: smooth;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--text-secondary, #8e8e93);
		padding: 40px;
		text-align: center;
	}

	.empty-icon {
		margin-bottom: 16px;
		opacity: 0.4;
	}

	.empty-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text-primary, #1c1c1e);
		margin-bottom: 8px;
	}

	.empty-subtitle {
		font-size: 14px;
	}

	.error-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 16px;
		background: #ff3b30;
		color: white;
		font-size: 13px;
		flex-shrink: 0;
	}

	.error-bar button {
		background: none;
		border: none;
		color: white;
		font-size: 18px;
		cursor: pointer;
		padding: 0 4px;
		line-height: 1;
	}
</style>
