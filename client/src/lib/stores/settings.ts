import { readable } from 'svelte/store';

export interface PublicSettings {
  announcementText: string;
  leaderboardVisible: string;
  defaultCardsPerSession: string;
  maintenanceMode: string;
}

const defaults: PublicSettings = {
  announcementText: '',
  leaderboardVisible: 'true',
  defaultCardsPerSession: '20',
  maintenanceMode: 'false',
};

export const publicSettings = readable<PublicSettings>(defaults, (set) => {
  fetch('/api/settings/public')
    .then((r) => r.json())
    .then(({ settings }) => set({ ...defaults, ...settings }))
    .catch(() => {}); // fail open — defaults remain
});
