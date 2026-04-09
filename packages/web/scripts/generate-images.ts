import {
	entities,
	getEntryMetadata,
	isCampaign,
	isDiscipline,
	isModule,
	isScenario
} from '@songsofdoom/game';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './generate-images.config.js';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.resolve(SCRIPT_DIR, '../src/lib/assets/img/cards');
const STATE_FILE = path.join(SCRIPT_DIR, '.image-gen-state.json');

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface Task {
	description: string;
	amendments: string[];
	status: 'pending' | 'running' | 'done' | 'failed';
	createdAt: string;
	updatedAt: string;
	/** Thought signature from the last successful generation, required for multi-turn amend. */
	thoughtSignature?: string;
	error?: string;
}

interface State {
	tasks: Record<string, Task>;
}

function loadState(): State {
	if (!fs.existsSync(STATE_FILE)) return { tasks: {} };
	return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) as State;
}

function saveState(state: State): void {
	fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasImage(entity: ReturnType<typeof entities.all>[number]): boolean {
	return !isDiscipline(entity) && !isModule(entity) && !isCampaign(entity) && !isScenario(entity);
}

function getEntityIds(): Set<string> {
	const ids = new Set<string>();
	for (const entity of entities.all()) {
		if (hasImage(entity)) {
			ids.add(getEntryMetadata(entity).id);
		}
	}
	return ids;
}

function cardImagePath(entityId: string): string {
	return path.join(IMAGES_DIR, `${entityId}.jpg`);
}

function imageExists(entityId: string): boolean {
	return fs.existsSync(cardImagePath(entityId));
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

async function generate(entityId: string, state: State): Promise<void> {
	const task = state.tasks[entityId];

	task.status = 'running';
	task.updatedAt = new Date().toISOString();
	saveState(state);

	console.log(`Generating image for '${entityId}'...`);

	try {
		if (!config.apiKey) {
			throw new Error('GEMINI_API_KEY environment variable is not set.');
		}

		const ai = new GoogleGenAI({ apiKey: config.apiKey });

		const systemText = `${config.systemPrompt}\n\nCard ID: ${entityId}`;
		const prevImagePath = cardImagePath(entityId);
		const hasPrevImage = task.amendments.length > 0 && fs.existsSync(prevImagePath);

		type InlineDataPart = { mimeType: string; data: string; thoughtSignature?: string };
		type ContentPart = { text: string } | { inlineData: InlineDataPart };
		type ContentItem = { role: string; parts: ContentPart[] };

		let contents: ContentItem[];

		if (hasPrevImage && task.thoughtSignature) {
			// Multi-turn: echo the previous image with its thought signature so the model
			// can refine it. The thought signature is mandatory for Gemini 3 models.
			const prevImageData = fs.readFileSync(prevImagePath).toString('base64');
			contents = [
				{ role: 'user', parts: [{ text: `${systemText}\n\n${task.description}` }] },
				{
					role: 'model',
					parts: [
						{
							inlineData: {
								mimeType: 'image/jpeg',
								data: prevImageData,
								thoughtSignature: task.thoughtSignature
							}
						}
					]
				},
				{ role: 'user', parts: [{ text: task.amendments.join('\n\n') }] }
			];
		} else {
			// Single turn: description + any amendments concatenated.
			// Also used as fallback when no thought signature is available.
			const textParts = [`${systemText}\n\n${task.description}`, ...task.amendments];
			contents = [{ role: 'user', parts: [{ text: textParts.join('\n\n') }] }];
		}

		const response = await ai.models.generateContent({
			model: config.model,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			contents: contents as any,
			config: {
				responseModalities: ['IMAGE', 'TEXT'],
				imageConfig: { aspectRatio: config.aspectRatio, imageSize: config.imageSize }
			}
		});

		const parts = response.candidates?.[0]?.content?.parts ?? [];
		const imagePart = parts.find((p) => p.inlineData);

		if (!imagePart?.inlineData?.data) {
			throw new Error('No image returned from Gemini API.');
		}

		const imageBytes = Buffer.from(imagePart.inlineData.data, 'base64');
		fs.writeFileSync(prevImagePath, imageBytes);

		task.status = 'done';
		task.updatedAt = new Date().toISOString();
		task.thoughtSignature = (imagePart.inlineData as InlineDataPart).thoughtSignature ?? undefined;
		delete task.error;
		saveState(state);

		console.log(`Image saved: ${prevImagePath}`);
	} catch (err) {
		task.status = 'failed';
		task.updatedAt = new Date().toISOString();
		task.error = err instanceof Error ? err.message : String(err);
		saveState(state);

		reportError(verbose ? err : `Generation failed for '${entityId}': ${task.error}`);
		process.exit(1);
	}
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdMissing(): void {
	const entityIds = getEntityIds();
	const missing = [...entityIds].filter((id) => !imageExists(id)).sort();

	if (missing.length === 0) {
		console.log('All cards have images.');
	} else {
		console.log(`${missing.length} card(s) missing images:\n`);
		for (const id of missing) {
			console.log(`  ${id}`);
		}
	}
}

async function cmdDescribe(args: string[]): Promise<void> {
	const redo = args.includes('--redo');
	const positional = args.filter((a) => a !== '--redo');

	if (positional.length < 2) {
		console.error('Usage: describe <card-id> <description> [--redo]');
		process.exit(1);
	}

	const [entityId, ...descParts] = positional;
	const description = descParts.join(' ');

	if (!getEntityIds().has(entityId)) {
		console.error(`Error: Card '${entityId}' not found in catalog.`);
		process.exit(1);
	}

	const state = loadState();

	if (imageExists(entityId) && !redo) {
		console.error(`Error: Image already exists for '${entityId}'. Use --redo to overwrite.`);
		process.exit(1);
	}

	if (state.tasks[entityId] && !redo) {
		console.error(`Error: Task already exists for '${entityId}'. Use --redo to replace it.`);
		process.exit(1);
	}

	const now = new Date().toISOString();
	state.tasks[entityId] = {
		description,
		amendments: [],
		status: 'pending',
		createdAt: now,
		updatedAt: now
	};
	saveState(state);

	await generate(entityId, state);
}

async function cmdAmend(args: string[]): Promise<void> {
	if (args.length < 2) {
		console.error('Usage: amend <card-id> <amendment>');
		process.exit(1);
	}

	const [entityId, ...amendParts] = args;
	const amendment = amendParts.join(' ');

	if (!getEntityIds().has(entityId)) {
		console.error(`Error: Card '${entityId}' not found in catalog.`);
		process.exit(1);
	}

	const state = loadState();

	if (!state.tasks[entityId]) {
		console.error(`Error: No prior task for '${entityId}'. Use 'describe' first.`);
		process.exit(1);
	}

	state.tasks[entityId].amendments.push(amendment);
	state.tasks[entityId].status = 'pending';
	state.tasks[entityId].updatedAt = new Date().toISOString();
	delete state.tasks[entityId].error;
	saveState(state);

	await generate(entityId, state);
}

function cmdStatus(): void {
	const state = loadState();
	const tasks = Object.entries(state.tasks);

	if (tasks.length === 0) {
		console.log('No generation tasks.');
		return;
	}

	const BAR_WIDTH = 20;
	const nameWidth = Math.max(...tasks.map(([id]) => id.length), 10) + 2;
	const counts = { done: 0, running: 0, pending: 0, failed: 0 };

	for (const [id, task] of tasks.sort(([a], [b]) => a.localeCompare(b))) {
		counts[task.status]++;

		let filled = 0;
		let statusLabel = '';
		let extra = '';

		switch (task.status) {
			case 'done':
				filled = BAR_WIDTH;
				statusLabel = 'DONE';
				extra = `(${new Date(task.updatedAt).toLocaleString()})`;
				break;
			case 'running':
				filled = Math.floor(BAR_WIDTH / 2);
				statusLabel = 'RUNNING';
				break;
			case 'pending':
				filled = 0;
				statusLabel = 'PENDING';
				break;
			case 'failed':
				filled = 0;
				statusLabel = 'FAILED';
				extra = task.error ?? '';
				break;
		}

		const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
		const name = id.padEnd(nameWidth);
		const status = statusLabel.padEnd(8);

		console.log(`${name} [${bar}] ${status} ${extra}`);
	}

	console.log();
	console.log(
		[
			`${counts.done} done`,
			`${counts.running} running`,
			`${counts.pending} pending`,
			`${counts.failed} failed`
		].join(' · ')
	);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const allArgs = process.argv.slice(2);
const verbose = allArgs.includes('-v') || allArgs.includes('--verbose');
const cliArgs = allArgs.filter((a) => a !== '-v' && a !== '--verbose');

function reportError(err: unknown): void {
	if (verbose) {
		console.error(err);
	} else {
		const message = err instanceof Error ? err.message : String(err);
		console.error(`Error: ${message}`);
	}
}

async function main(): Promise<void> {
	const [command, ...args] = cliArgs;

	switch (command) {
		case 'missing':
			cmdMissing();
			break;
		case 'describe':
			await cmdDescribe(args);
			break;
		case 'amend':
			await cmdAmend(args);
			break;
		case 'status':
			cmdStatus();
			break;
		default:
			console.error(`Unknown command: ${command ?? '(none)'}`);
			console.error('Available commands: missing, describe, amend, status');
			process.exit(1);
	}
}

main().catch((err) => {
	reportError(err);
	process.exit(1);
});
