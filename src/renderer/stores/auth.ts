import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utls/api'

export interface AuthUser {
  id: number
  name: string
  clientId: string
  role: string
  avatar?: any
}

export interface LoginCredentials {
  clientId: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // State
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(null)
  const tokenExpires = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isTokenExpired = computed(() => {
    if (!tokenExpires.value) return true
    return new Date() >= new Date(tokenExpires.value)
  })

  // Initialize auth state from localStorage
  function initializeAuth() {
    const storedToken = localStorage.getItem('token')
    const storedExpires = localStorage.getItem('token_expires')
    const storedRole = localStorage.getItem('token_role')
    const storedUser = localStorage.getItem('user_data')

    if (storedToken && storedExpires) {
      const expiresDate = new Date(storedExpires)

      // Check if token is expired
      if (new Date() >= expiresDate) {
        clearAuth()
        return false
      }

      token.value = storedToken
      tokenExpires.value = storedExpires

      // Try to restore user data
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (e) {
          // If stored user data is invalid, clear auth and require new login
          clearAuth()
          return false
        }
      } else {
        // No user data means this is likely an old admin token, clear and require new login
        clearAuth()
        return false
      }

      return true
    }

    return false
  }

  // User login with clientId and password
  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', {
        clientId: credentials.clientId,
        password: credentials.password
      })

      const { token: authToken, expires, role, user: userData } = response.data

      // Store auth data
      token.value = authToken
      tokenExpires.value = expires
      user.value = {
        id: userData.id,
        name: userData.name,
        clientId: userData.clientId,
        role: userData.role || role,
        avatar: userData.avatar
      }

      // Persist to localStorage
      localStorage.setItem('token', authToken)
      localStorage.setItem('token_expires', expires)
      localStorage.setItem('token_role', userData.role || role)
      localStorage.setItem('user_data', JSON.stringify(user.value))

      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Invalid credentials'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Set auth data (used after setup)
  function setAuth(authToken: string, userData: AuthUser) {
    token.value = authToken
    user.value = userData

    // Parse expires from token if available
    try {
      const tokenParts = authToken.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]))
        if (payload.exp) {
          const expires = new Date(payload.exp * 1000).toISOString()
          tokenExpires.value = expires
          localStorage.setItem('token_expires', expires)
        }
      }
    } catch (e) {
      // If we can't parse the token, set a default expiry
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      tokenExpires.value = expires
      localStorage.setItem('token_expires', expires)
    }

    // Persist to localStorage
    localStorage.setItem('token', authToken)
    localStorage.setItem('token_role', userData.role)
    localStorage.setItem('user_data', JSON.stringify(userData))
  }



  // Logout
  function logout() {
    clearAuth()
    router.push('/login')
  }

  // Clear authentication data
  function clearAuth() {
    user.value = null
    token.value = null
    tokenExpires.value = null
    error.value = null

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('token_expires')
    localStorage.removeItem('token_role')
    localStorage.removeItem('user_data')
  }

  // Check if user has permission
  function hasPermission(permission: string): boolean {
    if (!user.value) return false

    // Admin has all permissions
    if (user.value.role === 'admin') return true

    // TODO: Implement proper permission checking based on role
    // For now, basic role-based permissions
    const userPermissions = {
      admin: ['*'],
      user: ['users:read', 'users:update:own', 'games:read'],
      guest: ['games:read']
    }

    const rolePermissions = userPermissions[user.value.role as keyof typeof userPermissions] || []
    return rolePermissions.includes('*') || rolePermissions.includes(permission)
  }

  // Validate current token
  async function validateToken() {
    if (!token.value || isTokenExpired.value) {
      clearAuth()
      return false
    }

    try {
      // Try to make an authenticated request to validate token
      await api.get('/api/users/me') // This endpoint should return current user info
      return true
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        clearAuth()
        return false
      }
      // Other errors don't necessarily mean token is invalid
      return true
    }
  }

  // Refresh token if needed
  async function refreshTokenIfNeeded() {
    if (!token.value) return false

    // Check if token expires in the next 5 minutes
    if (tokenExpires.value) {
      const expiresDate = new Date(tokenExpires.value)
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)

      if (expiresDate <= fiveMinutesFromNow) {
        // Token is expiring soon, validate it
        return await validateToken()
      }
    }

    return true
  }

  // Clear error
  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    token,
    tokenExpires,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    isAdmin,
    isTokenExpired,

    // Actions
    initializeAuth,
    login,
    logout,
    clearAuth,
    setAuth,
    hasPermission,
    validateToken,
    refreshTokenIfNeeded,
    clearError
  }
})