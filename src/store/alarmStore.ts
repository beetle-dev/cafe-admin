import { create } from 'zustand';
import { type AlarmDto, getAlarms, resolveAlarm } from '../api/alarm';

interface AlarmStore {
  alarms: AlarmDto[];
  loading: boolean;
  fetch: () => Promise<void>;
  resolve: (id: number) => Promise<void>;
  addFromSSE: (alarm: AlarmDto) => void;
}

export const useAlarmStore = create<AlarmStore>((set, get) => ({
  alarms: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const alarms = await getAlarms();
      set({ alarms });
    } finally {
      set({ loading: false });
    }
  },

  resolve: async (id) => {
    await resolveAlarm(id);
    set((s) => ({
      alarms: s.alarms.map((a) =>
        a.id === id ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a
      ),
    }));
  },

  addFromSSE: (alarm) => {
    const exists = get().alarms.some((a) => a.id === alarm.id);
    if (!exists) {
      set((s) => ({ alarms: [alarm, ...s.alarms] }));
    }
  },
}));
