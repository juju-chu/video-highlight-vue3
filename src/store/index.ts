import { defineStore } from 'pinia';

export const useTranscriptStore = defineStore('transcript', {
  state: () => ({
    transcript: [] as TranscriptItem[],
    selectedIds: new Set<number>(),
  }),
  actions: {
    setTranscript(data: TranscriptItem[]) {
      this.transcript = data;
    },
    toggleSelect(id: number) {
      if (this.selectedIds.has(id)) {
        this.selectedIds.delete(id);
      } else {
        this.selectedIds.add(id);
      }
    },
    clearSelection() {
      this.selectedIds.clear();
    },
  },
});

export interface TranscriptItem {
  id: number;
  start: number;
  end: number;
  text: string;
  section: string;
}
