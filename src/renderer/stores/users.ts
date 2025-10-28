import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utls/api'

export interface Avatar {
  eyes: string
  eyebrows: string
  mouth: string
  glasses?: string
  earrings?: string
  hair: string
  hairColor: string
  skinColor: string
}

export interface User {
  id: number
  name: string
  clientId: string
  avatar?: Avatar | null
}

export interface CreateUserType {
  name: string
  clientId: string
  avatar?: Avatar | null
}

export interface UpdateUserType {
  name?: string
  clientId?: string
  avatar?: Avatar | null
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const totalUsers = computed(() => users.value.length)

  // Fetch all users
  async function fetchUsers() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get('/api/users')
      users.value = response.data.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch users'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Create a new user
  async function createUser(userData: CreateUserType) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/api/users', userData)
      const newUser = response.data.data
      users.value.push(newUser)
      return newUser
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to create user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update an existing user
  async function updateUser(id: number, userData: UpdateUserType) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.put(`/api/users/${id}`, userData)
      const updatedUser = response.data.data
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      return updatedUser
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to update user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update a user by client ID
  async function updateUserByClientId(clientId: string, userData: UpdateUserType) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.put(`/api/users/by-client-id/${clientId}`, userData)
      const updatedUser = response.data.data
      const index = users.value.findIndex(user => user.clientId === clientId)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      return updatedUser
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to update user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete a user
  async function deleteUser(id: number) {
    isLoading.value = true
    error.value = null

    try {
      await api.delete(`/api/users/${id}`)
      users.value = users.value.filter(user => user.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to delete user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get user by ID
  function getUserById(id: number): User | undefined {
    return users.value.find(user => user.id === id)
  }

  // Find user by client ID
  async function findUserByClientId(clientId: string): Promise<User | null> {
    try {
      const response = await api.get(`/api/users/by-client-id/${clientId}`)
      return response.data.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null
      }
      throw err
    }
  }

  // Search users by name
  const searchUsers = computed(() => {
    return (searchTerm: string) => {
      if (!searchTerm.trim()) return users.value
      
      const term = searchTerm.toLowerCase()
      return users.value.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.clientId.toLowerCase().includes(term)
      )
    }
  })

  // Check if client ID is available
  function isClientIdAvailable(clientId: string, excludeId?: number): boolean {
    return !users.value.some(user => 
      user.clientId === clientId && user.id !== excludeId
    )
  }

  // Clear error
  function clearError() {
    error.value = null
  }

  // Reset store
  function resetStore() {
    users.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    users,
    isLoading,
    error,
    
    // Computed
    totalUsers,
    searchUsers,
    
    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    findUserByClientId,
    isClientIdAvailable,
    clearError,
    resetStore,
  }
})