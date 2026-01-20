import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    devModeOpen: false,
  }),
  actions: {
    openDevMode() {
      this.devModeOpen = true;
    },
    closeDevMode() {
      this.devModeOpen = false;
    },
    toggleDevMode() {
      this.devModeOpen = !this.devModeOpen;
    },
  },
});


