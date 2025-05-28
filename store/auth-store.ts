import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface LocalUser {
  id: string
  name: string
  email: string
  password: string // In production, this would be hashed
  avatar?: string
  createdAt: string
}

interface AuthStore {
  users: LocalUser[]
  currentUser: LocalUser | null
  isAuthenticated: boolean
  isLoaded: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<Omit<LocalUser, "id" | "password" | "createdAt">>) => void
  changePassword: (currentPassword: string, newPassword: string) => boolean
  deleteAccount: () => void
}

// Simple hash function for demo purposes (use proper hashing in production)
const simpleHash = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      isAuthenticated: false,
      isLoaded: false,

      login: async (email: string, password: string) => {
        const { users } = get()
        const hashedPassword = simpleHash(password)
        const user = users.find((u) => u.email === email && u.password === hashedPassword)

        if (user) {
          set({
            currentUser: user,
            isAuthenticated: true,
          })
          return true
        }
        return false
      },

      signup: async (name: string, email: string, password: string) => {
        const { users } = get()

        // Check if user already exists
        if (users.find((u) => u.email === email)) {
          return false
        }

        const newUser: LocalUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          password: simpleHash(password),
          createdAt: new Date().toISOString(),
        }

        set({
          users: [...users, newUser],
          currentUser: newUser,
          isAuthenticated: true,
        })
        return true
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
        })
      },

      updateProfile: (updates) => {
        const { currentUser, users } = get()
        if (!currentUser) return

        const updatedUser = { ...currentUser, ...updates }
        const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u))

        set({
          currentUser: updatedUser,
          users: updatedUsers,
        })
      },

      changePassword: (currentPassword: string, newPassword: string) => {
        const { currentUser, users } = get()
        if (!currentUser) return false

        const hashedCurrentPassword = simpleHash(currentPassword)
        if (currentUser.password !== hashedCurrentPassword) return false

        const hashedNewPassword = simpleHash(newPassword)
        const updatedUser = { ...currentUser, password: hashedNewPassword }
        const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u))

        set({
          currentUser: updatedUser,
          users: updatedUsers,
        })
        return true
      },

      deleteAccount: () => {
        const { currentUser, users } = get()
        if (!currentUser) return

        const updatedUsers = users.filter((u) => u.id !== currentUser.id)
        set({
          users: updatedUsers,
          currentUser: null,
          isAuthenticated: false,
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
