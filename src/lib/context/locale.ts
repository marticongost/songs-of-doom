import type { Locale } from '$lib/localisation';
import { createContext } from 'svelte';

export const [getLocale, setLocale] = createContext<Locale>();
