const DEFAULT_URL = 'http://localhost:18789';

export interface ChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

function resolveUrl(gatewayUrl: string): string {
	return gatewayUrl || DEFAULT_URL;
}

async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
	try {
		const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
		return await tauriFetch(url, init);
	} catch {
		return await globalThis.fetch(url, init);
	}
}

export async function checkConnection(gatewayUrl: string, token: string): Promise<boolean> {
	try {
		const base = resolveUrl(gatewayUrl);
		const headers: Record<string, string> = {};
		if (token) headers['Authorization'] = `Bearer ${token}`;

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 3000);
		const res = await apiFetch(`${base}/v1/chat/completions`, {
			method: 'POST',
			headers: { ...headers, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: 'openclaw',
				messages: [{ role: 'user', content: 'ping' }],
				max_tokens: 1
			}),
			signal: controller.signal
		});
		clearTimeout(timeout);
		// Any non-HTML response means we reached the API
		const contentType = res.headers.get('content-type') || '';
		return contentType.includes('json') || contentType.includes('text/event-stream') || res.ok;
	} catch {
		return false;
	}
}

export async function streamChat(
	gatewayUrl: string,
	model: string,
	agentId: string,
	token: string,
	messages: ChatMessage[],
	onChunk: (text: string) => void,
	onDone: () => void,
	onError: (err: Error) => void,
	signal?: AbortSignal
) {
	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		};
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}
		if (agentId) {
			headers['x-openclaw-agent-id'] = agentId;
		}

		const base = resolveUrl(gatewayUrl);
		const res = await apiFetch(`${base}/v1/chat/completions`, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				model: model || 'openclaw',
				messages,
				stream: true,
				user: 'clawface-app'
			}),
			signal
		});

		if (!res.ok) {
			const body = await res.text().catch(() => '');
			// Check if we got HTML back (Gateway UI instead of API)
			if (body.includes('<!doctype html>') || body.includes('<html')) {
				throw new Error('Gateway returned HTML instead of API response. Check your auth token in Settings.');
			}
			throw new Error(`HTTP ${res.status}: ${body || res.statusText}`);
		}

		const reader = res.body?.getReader();
		if (!reader) throw new Error('No response body');

		const decoder = new TextDecoder();
		let buffer = '';

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop() || '';

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed || trimmed.startsWith(':')) continue;
				if (!trimmed.startsWith('data: ')) continue;

				const data = trimmed.slice(6);
				if (data === '[DONE]') {
					onDone();
					return;
				}

				try {
					const parsed = JSON.parse(data);
					const content = parsed.choices?.[0]?.delta?.content;
					if (content) {
						onChunk(content);
					}
				} catch {
					// Skip malformed JSON lines
				}
			}
		}

		onDone();
	} catch (err) {
		if (err instanceof DOMException && err.name === 'AbortError') return;
		onError(err instanceof Error ? err : new Error(String(err)));
	}
}
