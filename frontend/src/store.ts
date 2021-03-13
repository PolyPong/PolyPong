import { writable, derived } from "svelte/store";

export const isAuthenticated = writable(false);
export const user = writable<any>({});
export const popupOpen = writable(false);
export const error = writable(null);

export const ws = writable(new WebSocket("ws://localhost:5000/ws"));
