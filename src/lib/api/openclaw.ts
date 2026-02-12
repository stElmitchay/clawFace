export interface ChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export async function checkConnection(gatewayUrl: string): Promise<boolean> {
	try {
		const res = await fetch(`${gatewayUrl}/v1/models`, {
			method: 'GET',
			signal: AbortSignal.timeout(3000)
		});
		return res.ok;
	} catch {
		return false;
	}
}

export async function streamChat(
	gatewayUrl: string,
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

		const res = await fetch(`${gatewayUrl}/v1/chat/completions`, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				messages,
				stream: true
			}),
			signal
		});

		if (!res.ok) {
			const body = await res.text().catch(() => '');
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
