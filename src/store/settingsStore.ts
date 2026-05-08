import { create } from 'zustand'

const SHORT_THRESHOLD_KEY = 'yt_short_threshold'
const DEFAULT_THRESHOLD = 60

interface SettingsStore {
  shortThreshold: number
  setShortThreshold: (v: number) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  shortThreshold: parseInt(localStorage.getItem(SHORT_THRESHOLD_KEY) ?? String(DEFAULT_THRESHOLD), 10),
  setShortThreshold: (v) => {
    localStorage.setItem(SHORT_THRESHOLD_KEY, String(v))
    set({ shortThreshold: v })
  },
}))
