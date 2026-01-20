import { defineStore } from 'pinia';
import type { MovieSummary } from '../types/movies';

const STORAGE_KEY = 'cinescope_watchlist_v1';

function loadInitial(): MovieSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MovieSummary[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export const useWatchlistStore = defineStore('watchlist', {
  state: () => ({
    items: loadInitial() as MovieSummary[],
  }),
  getters: {
    count: (s) => s.items.length,
    isInList: (s) => (id: number) => s.items.some((m) => m.id === id),
  },
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    },
    toggle(movie: MovieSummary) {
      const idx = this.items.findIndex((m) => m.id === movie.id);
      if (idx >= 0) this.items.splice(idx, 1);
      else this.items.unshift(movie);
      this.persist();
    },
    remove(id: number) {
      const idx = this.items.findIndex((m) => m.id === id);
      if (idx >= 0) {
        this.items.splice(idx, 1);
        this.persist();
      }
    },
    clear() {
      this.items = [];
      this.persist();
    },
  },
});


