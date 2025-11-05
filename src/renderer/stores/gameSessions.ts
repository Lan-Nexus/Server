import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utls/api'
import { useUsersStore, type User } from './users'
import webSocketManager, { type GameSessionEventData, type WebSocketCallbacks } from '@/utls/websocket'

export interface GameSession {
  id: number
  clientId: string
  gameId: number
  startTime: string
  endTime?: string
  isActive: number
  durationSeconds?: number
  user?: User
}

export interface CreateGameSessionType {
  clientId: string
  gameId: number
  startTime?: string
  endTime?: string
  isActive?: number
}

export const useGameSessionsStore = defineStore('gameSessions', () => {
  // State
  const sessions = ref<GameSession[]>([])
  const activeSessions = ref<GameSession[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isConnected = ref(false)
  const isWebSocketEnabled = ref(true)
  
  // Get users store for user data
  const usersStore = useUsersStore()

  // Computed
  const sessionCount = computed(() => sessions.value.length)
  const activeSessionCount = computed(() => activeSessions.value.length)
  
  const sessionsByClient = computed(() => {
    const grouped: Record<string, GameSession[]> = {}
    sessions.value.forEach(session => {
      if (!grouped[session.clientId]) {
        grouped[session.clientId] = []
      }
      grouped[session.clientId].push(session)
    })
    return grouped
  })

  const sessionsByGame = computed(() => {
    const grouped: Record<number, GameSession[]> = {}
    sessions.value.forEach(session => {
      if (!grouped[session.gameId]) {
        grouped[session.gameId] = []
      }
      grouped[session.gameId].push(session)
    })
    return grouped
  })

  // Actions
  async function fetchAllSessions() {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/api/game-sessions')
      const sessionsData = response.data.sessions || []
      
      // Enhance sessions with user data
      sessions.value = await enhanceSessionsWithUserData(sessionsData)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch sessions'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchActiveSessions() {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/api/game-sessions/active')
      const sessionsData = response.data.sessions || []
      
      // Enhance sessions with user data
      activeSessions.value = await enhanceSessionsWithUserData(sessionsData)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch active sessions'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // WebSocket event handlers
  function handleSessionStarted(sessionData: GameSessionEventData) {
    enhanceSessionWithUserData(sessionData).then(enhancedSession => {
      // Add to sessions if not already present
      const existingIndex = sessions.value.findIndex(s => s.id === enhancedSession.id)
      if (existingIndex === -1) {
        sessions.value.unshift(enhancedSession)
      }
      
      // Add to active sessions if not already present
      const activeIndex = activeSessions.value.findIndex(s => s.id === enhancedSession.id)
      if (activeIndex === -1) {
        activeSessions.value.unshift(enhancedSession)
      }
    })
  }

  function handleSessionEnded(sessionData: GameSessionEventData) {
    enhanceSessionWithUserData(sessionData).then(enhancedSession => {
      // Update in sessions array
      const sessionIndex = sessions.value.findIndex(s => s.id === enhancedSession.id)
      if (sessionIndex !== -1) {
        sessions.value[sessionIndex] = enhancedSession
      }
      
      // Remove from active sessions
      activeSessions.value = activeSessions.value.filter(s => s.id !== enhancedSession.id)
    })
  }

  function handleSessionUpdated(sessionData: GameSessionEventData) {
    enhanceSessionWithUserData(sessionData).then(enhancedSession => {
      // Update in sessions array
      const sessionIndex = sessions.value.findIndex(s => s.id === enhancedSession.id)
      if (sessionIndex !== -1) {
        sessions.value[sessionIndex] = enhancedSession
      }
      
      // Update in active sessions if it's active, otherwise remove it
      const activeIndex = activeSessions.value.findIndex(s => s.id === enhancedSession.id)
      if (enhancedSession.isActive === 1) {
        if (activeIndex !== -1) {
          activeSessions.value[activeIndex] = enhancedSession
        } else {
          activeSessions.value.push(enhancedSession)
        }
      } else {
        if (activeIndex !== -1) {
          activeSessions.value.splice(activeIndex, 1)
        }
      }
    })
  }

  function handleSessionDeleted(data: { id: number }) {
    // Remove from both arrays
    sessions.value = sessions.value.filter(s => s.id !== data.id)
    activeSessions.value = activeSessions.value.filter(s => s.id !== data.id)
  }

  function handleClientSessionsStopped(data: { clientId: string; sessionIds: number[] }) {
    // Update sessions to mark them as inactive
    sessions.value.forEach(session => {
      if (data.sessionIds.includes(session.id)) {
        session.isActive = 0
        session.endTime = new Date().toISOString()
      }
    })
    
    // Remove from active sessions
    activeSessions.value = activeSessions.value.filter(
      session => !data.sessionIds.includes(session.id)
    )
  }

  function handleActiveSessionsUpdated(data: { sessions: GameSessionEventData[] }) {
    // Replace active sessions with the server's current list
    enhanceSessionsWithUserData(data.sessions).then(enhancedSessions => {
      activeSessions.value = enhancedSessions
    })
  }

  function handleWebSocketConnected() {
    console.log('WebSocket connected - game sessions store')
    isConnected.value = true
    error.value = null
  }

  function handleWebSocketDisconnected() {
    console.log('WebSocket disconnected - game sessions store')
    isConnected.value = false
  }

  function handleWebSocketError(error: any) {
    console.error('WebSocket error in game sessions store:', error)
    // Don't overwrite existing errors, just log
  }

  // Initialize WebSocket connection and event handlers
  function initializeWebSocket() {
    if (!isWebSocketEnabled.value) return
    
    const callbacks: WebSocketCallbacks = {
      onSessionStarted: handleSessionStarted,
      onSessionEnded: handleSessionEnded,
      onSessionUpdated: handleSessionUpdated,
      onSessionDeleted: handleSessionDeleted,
      onClientSessionsStopped: handleClientSessionsStopped,
      onActiveSessionsUpdated: handleActiveSessionsUpdated,
      onConnected: handleWebSocketConnected,
      onDisconnected: handleWebSocketDisconnected,
      onError: handleWebSocketError
    }
    
    webSocketManager.setCallbacks(callbacks)
    isConnected.value = webSocketManager.getConnectionStatus()
  }

  // Cleanup WebSocket connection
  function cleanupWebSocket() {
    // We don't disconnect the websocket as other stores might be using it
    // Just clear our callbacks by setting empty ones
    webSocketManager.setCallbacks({})
  }

  // Toggle WebSocket functionality
  function toggleWebSocket() {
    isWebSocketEnabled.value = !isWebSocketEnabled.value
    if (isWebSocketEnabled.value) {
      initializeWebSocket()
    } else {
      cleanupWebSocket()
      isConnected.value = false
    }
  }

  // Manual refresh that works with or without WebSocket
  async function refreshActiveSessions() {
    if (isWebSocketEnabled.value && isConnected.value) {
      // If WebSocket is connected, we're already getting real-time updates
      // But we can still do a manual fetch if needed
      console.log('WebSocket is connected, but forcing manual refresh')
    }
    
    await fetchActiveSessions()
  }

  async function fetchClientSessions(clientId: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/game-sessions/client/${clientId}`)
      const sessionsData = response.data.sessions || []
      
      // Enhance sessions with user data
      return await enhanceSessionsWithUserData(sessionsData)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch client sessions'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGameSessions(gameId: number) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/game-sessions/game/${gameId}`)
      return response.data.sessions || []
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch game sessions'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getActiveSessionForClient(clientId: string) {
    try {
      const response = await api.get(`/api/game-sessions/client/${clientId}/active`)
      return response.data.session
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null // No active session
      }
      error.value = err.response?.data?.error || 'Failed to fetch active session'
      throw err
    }
  }

  async function startSession(clientId: string, gameId: number) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/api/game-sessions', {
        clientId,
        gameId
      })
      
      const newSession = response.data.session
      
      // Update local state
      sessions.value.unshift(newSession)
      activeSessions.value.unshift(newSession)
      
      return newSession
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to start session'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function stopSession(sessionId: number) {
    isLoading.value = true
    error.value = null

    try {
      await api.post(`/api/game-sessions/${sessionId}/stop`)
      
      // Update local state
      const sessionIndex = sessions.value.findIndex(s => s.id === sessionId)
      if (sessionIndex !== -1) {
        sessions.value[sessionIndex].isActive = 0
        sessions.value[sessionIndex].endTime = new Date().toISOString()
      }
      
      const activeIndex = activeSessions.value.findIndex(s => s.id === sessionId)
      if (activeIndex !== -1) {
        activeSessions.value.splice(activeIndex, 1)
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to stop session'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function stopClientSessions(clientId: string) {
    isLoading.value = true
    error.value = null

    try {
      await api.post(`/api/game-sessions/client/${clientId}/stop`)
      
      // Update local state
      sessions.value.forEach(session => {
        if (session.clientId === clientId && session.isActive === 1) {
          session.isActive = 0
          session.endTime = new Date().toISOString()
        }
      })
      
      activeSessions.value = activeSessions.value.filter(
        session => session.clientId !== clientId
      )
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to stop client sessions'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createSession(sessionData: CreateGameSessionType) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/api/game-sessions/create', sessionData)
      
      const newSession = response.data.session
      sessions.value.unshift(newSession)
      
      if (newSession.isActive === 1) {
        activeSessions.value.unshift(newSession)
      }
      
      return newSession
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create session'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateSession(sessionId: number, sessionData: Partial<GameSession>) {
    isLoading.value = true
    error.value = null

    try {
      await api.put(`/api/game-sessions/${sessionId}`, sessionData)
      
      // Update local state
      const sessionIndex = sessions.value.findIndex(s => s.id === sessionId)
      if (sessionIndex !== -1) {
        sessions.value[sessionIndex] = { ...sessions.value[sessionIndex], ...sessionData }
      }
      
      // Update active sessions if needed
      const activeIndex = activeSessions.value.findIndex(s => s.id === sessionId)
      if (activeIndex !== -1) {
        if (sessionData.isActive === 0) {
          activeSessions.value.splice(activeIndex, 1)
        } else {
          activeSessions.value[activeIndex] = { ...activeSessions.value[activeIndex], ...sessionData }
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update session'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteSession(sessionId: number) {
    isLoading.value = true
    error.value = null

    try {
      await api.delete(`/api/game-sessions/${sessionId}`)
      
      // Remove from local state
      sessions.value = sessions.value.filter(s => s.id !== sessionId)
      activeSessions.value = activeSessions.value.filter(s => s.id !== sessionId)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete session'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getSessionDetails(sessionId: number) {
    try {
      const response = await api.get(`/api/game-sessions/${sessionId}`)
      return response.data.session
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch session details'
      throw err
    }
  }

  // Utility functions
  function formatDuration(durationSeconds: number): string {
    if (!durationSeconds) return '0s'
    
    const hours = Math.floor(durationSeconds / 3600)
    const minutes = Math.floor((durationSeconds % 3600) / 60)
    const seconds = durationSeconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  function calculateSessionDuration(session: GameSession): number {
    const startTime = new Date(session.startTime)
    const endTime = session.endTime ? new Date(session.endTime) : new Date()
    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
  }

  function clearError() {
    error.value = null
  }

  function clearSessions() {
    sessions.value = []
    activeSessions.value = []
  }

  // Helper function to enhance sessions with user data
  async function enhanceSessionsWithUserData(sessionsData: GameSession[]): Promise<GameSession[]> {
    // Ensure users are loaded
    if (usersStore.users.length === 0) {
      try {
        await usersStore.fetchUsers()
      } catch (error) {
        console.warn('Failed to fetch users for session enhancement:', error)
      }
    }

    // Enhance each session with user data
    return sessionsData.map(session => {
      const user = usersStore.users.find(u => u.clientId === session.clientId)
      return {
        ...session,
        user: user || undefined
      }
    })
  }

  // Helper function to enhance a single session with user data
  async function enhanceSessionWithUserData(sessionData: GameSessionEventData): Promise<GameSession> {
    // Ensure users are loaded
    if (usersStore.users.length === 0) {
      try {
        await usersStore.fetchUsers()
      } catch (error) {
        console.warn('Failed to fetch users for session enhancement:', error)
      }
    }

    const user = usersStore.users.find(u => u.clientId === sessionData.clientId)
    return {
      ...sessionData,
      user: user || undefined
    }
  }

  // Helper function to get user info for a session
  function getUserForSession(session: GameSession): User | undefined {
    return session.user || usersStore.users.find(u => u.clientId === session.clientId)
  }

  // Initialize WebSocket when store is created
  initializeWebSocket()

  return {
    // State
    sessions,
    activeSessions,
    isLoading,
    error,
    isConnected,
    isWebSocketEnabled,

    // Computed
    sessionCount,
    activeSessionCount,
    sessionsByClient,
    sessionsByGame,

    // Actions
    fetchAllSessions,
    fetchActiveSessions,
    fetchClientSessions,
    fetchGameSessions,
    getActiveSessionForClient,
    startSession,
    stopSession,
    stopClientSessions,
    createSession,
    updateSession,
    deleteSession,
    getSessionDetails,

    // WebSocket management
    initializeWebSocket,
    cleanupWebSocket,
    toggleWebSocket,
    refreshActiveSessions,

    // Utilities
    formatDuration,
    calculateSessionDuration,
    clearError,
    clearSessions,
    enhanceSessionsWithUserData,
    enhanceSessionWithUserData,
    getUserForSession
  }
})