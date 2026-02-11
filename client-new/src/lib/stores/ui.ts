import { writable } from 'svelte/store';

interface UIState {
  showSessionSummary: boolean;
  showAchievementModal: boolean;
  showLevelUpModal: boolean;
  showDefinition: boolean;
  sidebarOpen: boolean;
  currentAchievement: string | null;
}

function createUIStore() {
  const { subscribe, set, update } = writable<UIState>({
    showSessionSummary: false,
    showAchievementModal: false,
    showLevelUpModal: false,
    showDefinition: false,
    sidebarOpen: true,
    currentAchievement: null,
  });

  return {
    subscribe,

    openSessionSummary() {
      update((state) => ({ ...state, showSessionSummary: true }));
    },

    closeSessionSummary() {
      update((state) => ({ ...state, showSessionSummary: false }));
    },

    showAchievement(achievementId: string) {
      update((state) => ({
        ...state,
        showAchievementModal: true,
        currentAchievement: achievementId,
      }));
    },

    closeAchievement() {
      update((state) => ({
        ...state,
        showAchievementModal: false,
        currentAchievement: null,
      }));
    },

    showLevelUp() {
      update((state) => ({ ...state, showLevelUpModal: true }));
    },

    closeLevelUp() {
      update((state) => ({ ...state, showLevelUpModal: false }));
    },

    toggleDefinition() {
      update((state) => ({ ...state, showDefinition: !state.showDefinition }));
    },

    setDefinitionVisible(visible: boolean) {
      update((state) => ({ ...state, showDefinition: visible }));
    },

    toggleSidebar() {
      update((state) => ({ ...state, sidebarOpen: !state.sidebarOpen }));
    },

    setSidebarOpen(open: boolean) {
      update((state) => ({ ...state, sidebarOpen: open }));
    },
  };
}

export const ui = createUIStore();
