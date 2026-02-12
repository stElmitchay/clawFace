import { streamChat, type ChatMessage } from '$lib/api/openclaw';
import { getSettings } from './settings.svelte';

export interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
}

let messages = $state<Message[]>([]);
let loading = $state(false);
let error = $state<string | null>(null);
let abortController: AbortController | null = null;

function makeId() {
	return crypto.randomUUID();
}

export function getMessages() {
	return messages;
}

export function isLoading() {
	return loading;
}

export function getError() {
	return error;
}

export function clearError() {
	error = null;
}

export function clearMessages() {
	messages = [];
	error = null;
}

export function stopGeneration() {
	if (abortController) {
		abortController.abort();
		abortController = null;
		loading = false;
	}
}

export async function sendMessage(content: string) {
	if (!content.trim() || loading) return;

	error = null;

	const userMsg: Message = {
		id: makeId(),
		role: 'user',
		content: content.trim(),
		timestamp: Date.now()
	};
	messages.push(userMsg);

	const assistantMsg: Message = {
		id: makeId(),
		role: 'assistant',
		content: '',
		timestamp: Date.now()
	};
	messages.push(assistantMsg);

	loading = true;
	abortController = new AbortController();

	const apiMessages: ChatMessage[] = messages
		.filter((m) => m.content || m.id === assistantMsg.id)
		.filter((m) => m.id !== assistantMsg.id)
		.map((m) => ({ role: m.role, content: m.content }));

	const settings = getSettings();

	await streamChat(
		settings.gatewayUrl,
		settings.model,
		settings.agentId,
		settings.token,
		apiMessages,
		(chunk) => {
			const idx = messages.findIndex((m) => m.id === assistantMsg.id);
			if (idx !== -1) {
				messages[idx].content += chunk;
			}
		},
		() => {
			loading = false;
			abortController = null;
		},
		(err) => {
			loading = false;
			abortController = null;
			error = err.message;
			// Remove empty assistant message on error
			const idx = messages.findIndex((m) => m.id === assistantMsg.id);
			if (idx !== -1 && !messages[idx].content) {
				messages.splice(idx, 1);
			}
		},
		abortController.signal
	);
}
