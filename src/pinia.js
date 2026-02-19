// src/pinia.js
import { createPinia } from "pinia";

export const pinia = createPinia();

// Lightweight persistence (no extra deps)
// Fixes: cart "disappears" after refresh / hard navigation
pinia.use(({ store }) => {
  // Only persist the cart store (auth already uses localStorage)
  if (store.$id !== "cart") return;

  const key = `pinia_${store.$id}`;

  // Rehydrate
  try {
    const raw = localStorage.getItem(key);
    if (raw) store.$patch(JSON.parse(raw));
  } catch {
    // ignore
  }

  // Persist on any change
  store.$subscribe(
    (_mutation, state) => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // ignore
      }
    },
    { detached: true }
  );
});
