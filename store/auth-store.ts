import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface LocalUser {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
}

interface AuthStore {
  currentUser: LocalUser | null
  isLoaded: boolean
  setCurrentUser: (user: LocalUser) => void
  clearCurrentUser: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      isLoaded: false,

      setCurrentUser: (user: LocalUser) => {
        set({
          currentUser: user,
        })
      },

      clearCurrentUser: () => {
        set({
          currentUser: null,
        })
      },
    }),
    {
      name: "boardstack-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true
        }
      },
    },
  ),
)
