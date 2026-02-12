import { browser } from '$app/environment';

const STORAGE_KEY = 'openclaw-settings-v2';

interface Settings {
	gatewayUrl: string;
	model: string;
	token: string;
	theme: 'system' | 'light' | 'dark';
}

const defaults: Settings = {
	gatewayUrl: 'http://localhost:11434',
	model: 'qwen2.5-coder:7b',
	token: '',
	theme: 'system'
};

function loadSettings(): Settings {
	if (!browser) return { ...defaults };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = { ...defaults, ...JSON.parse(raw) };
			// Never allow an empty gatewayUrl
			if (!parsed.gatewayUrl) parsed.gatewayUrl = defaults.gatewayUrl;
			return parsed;
		}
	} catch {}
	return { ...defaults };
}

function saveSettings(s: Settings) {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

let settings = $state<Settings>(loadSettings());

export function getSettings() {
	return settings;
}

export function updateSettings(patch: Partial<Settings>) {
	settings = { ...settings, ...patch };
	saveSettings(settings);
}
