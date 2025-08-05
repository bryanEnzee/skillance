import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarStore {
  width: number
  minWidth: number
  maxWidth: number
  isOpen: boolean
  setWidth: (width: number) => void
  resetWidth: () => void
  setIsOpen: (isOpen: boolean) => void
}

const DEFAULT_WIDTH = 384 // 24rem or w-96
const MIN_WIDTH = 320 // 20rem or w-80
const MAX_WIDTH = 640 // 40rem

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      width: DEFAULT_WIDTH,
      minWidth: MIN_WIDTH,
      maxWidth: MAX_WIDTH,
      isOpen: false,
      setWidth: (width: number) => set({ width: Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH) }),
      resetWidth: () => set({ width: DEFAULT_WIDTH }),
      setIsOpen: (isOpen: boolean) => set({ isOpen }),
    }),
    {
      name: 'sidebar-width',
    }
  )
)
