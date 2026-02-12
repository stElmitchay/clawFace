<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import type { Message } from '$lib/stores/chat.svelte';

	interface Props {
		message: Message;
	}

	let { message }: Props = $props();

	marked.setOptions({
		breaks: true,
		gfm: true
	});

	let rendered = $derived(
		message.role === 'assistant' && message.content
			? DOMPurify.sanitize(marked.parse(message.content) as string)
			: ''
	);
</script>

<div class="message" class:user={message.role === 'user'} class:assistant={message.role === 'assistant'}>
	<div class="bubble">
		{#if message.role === 'user'}
			<p>{message.content}</p>
		{:else if message.content}
			<div class="markdown">{@html rendered}</div>
		{:else}
			<div class="typing">
				<span class="dot"></span>
				<span class="dot"></span>
				<span class="dot"></span>
			</div>
		{/if}
	</div>
</div>

<style>
	.message {
		display: flex;
		margin-bottom: 12px;
		padding: 0 16px;
	}

	.message.user {
		justify-content: flex-end;
	}

	.message.assistant {
		justify-content: flex-start;
	}

	.bubble {
		max-width: 75%;
		padding: 10px 14px;
		border-radius: 16px;
		line-height: 1.5;
		font-size: 14px;
	}

	.user .bubble {
		background: #007aff;
		color: white;
		border-bottom-right-radius: 4px;
	}

	.assistant .bubble {
		background: var(--bubble-assistant, #e5e5ea);
		color: var(--text-primary, #1c1c1e);
		border-bottom-left-radius: 4px;
	}

	.bubble p {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.bubble :global(.markdown) {
		overflow-wrap: break-word;
	}

	.bubble :global(.markdown p) {
		margin: 0 0 8px;
	}

	.bubble :global(.markdown p:last-child) {
		margin-bottom: 0;
	}

	.bubble :global(.markdown pre) {
		background: var(--code-bg, rgba(0, 0, 0, 0.06));
		border-radius: 8px;
		padding: 10px 12px;
		overflow-x: auto;
		font-size: 13px;
		margin: 8px 0;
	}

	.bubble :global(.markdown code) {
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
		font-size: 13px;
	}

	.bubble :global(.markdown :not(pre) > code) {
		background: var(--code-bg, rgba(0, 0, 0, 0.06));
		padding: 2px 5px;
		border-radius: 4px;
	}

	.typing {
		display: flex;
		gap: 4px;
		padding: 4px 0;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-secondary, #8e8e93);
		animation: bounce 1.4s ease-in-out infinite;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes bounce {
		0%,
		60%,
		100% {
			transform: translateY(0);
		}
		30% {
			transform: translateY(-4px);
		}
	}
</style>
