import { io, Socket } from 'socket.io-client'

export interface GameSessionEventData {
  id: number
  clientId: string
  gameId: number
  startTime: string
  endTime?: string
  isActive: number
  durationSeconds?: number
}

export interface WebSocketCallbacks {
  onSessionStarted?: (session: GameSessionEventData) => void
  onSessionEnded?: (session: GameSessionEventData) => void
  onSessionUpdated?: (session: GameSessionEventData) => void
  onSessionDeleted?: (data: { id: number }) => void
  onClientSessionsStopped?: (data: { clientId: string; sessionIds: number[] }) => void
  onActiveSessionsUpdated?: (data: { sessions: GameSessionEventData[] }) => void
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: any) => void
}

class WebSocketManager {
  private socket: Socket | null = null
  private callbacks: WebSocketCallbacks = {}
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: number | null = null

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      // Debug current location info
      console.log('🔌 WebSocket Debug Info:')
      console.log('  - Current origin:', window.location.origin)
      console.log('  - Current host:', window.location.host)
      console.log('  - Current port:', window.location.port)
      console.log('  - Current protocol:', window.location.protocol)
      console.log('  - Current pathname:', window.location.pathname)

      // Test if the proxy is working by checking if we can reach the backend
      this.testProxyConnection().then(isProxyWorking => {
        console.log('🔧 Proxy test result:', isProxyWorking ? 'Working' : 'Failed')
        this.createSocketConnection()
      }).catch(() => {
        console.log('🔧 Proxy test failed, attempting direct connection')
        this.createSocketConnection()
      })
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket connection:', error)
      this.callbacks.onError?.(error)
      this.scheduleReconnect()
    }
  }

  private async testProxyConnection(): Promise<boolean> {
    try {
      // Test if we can reach the backend through the proxy
      const response = await fetch('/api/ip', {
        method: 'GET',
        timeout: 5000
      } as any)
      return response.ok
    } catch (error) {
      console.log('🔧 Proxy test error:', error)
      return false
    }
  }

  private createSocketConnection() {
    try {
      // Determine the correct server URL
      let serverUrl = undefined // Let Socket.IO auto-detect

      // If we're on a development port and proxy test failed, connect directly
      if ((window.location.port === '5173' || window.location.port === '4173')) {
        console.log('🔧 Development mode detected, checking proxy...')
        // Use explicit URL for development if proxy doesn't work
        const protocol = window.location.protocol
        const hostname = window.location.hostname
        serverUrl = `${protocol}//${hostname}:3000`
        console.log('🔧 Will try direct connection to:', serverUrl)
      }

      console.log('🔌 Creating Socket.IO connection to:', serverUrl || 'auto-detected')

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        autoConnect: true,
        reconnection: false, // We'll handle reconnection manually
        timeout: 10000, // Reduce timeout to 10 seconds
        forceNew: true
      })

      this.setupEventListeners()
    } catch (error) {
      console.error('❌ Failed to create Socket.IO connection:', error)
      this.callbacks.onError?.(error)
      this.scheduleReconnect()
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id)
      console.log('✅ Transport used:', this.socket?.io?.engine?.transport?.name)
      this.isConnected = true
      this.reconnectAttempts = 0
      if (this.reconnectTimeout) {
        window.clearTimeout(this.reconnectTimeout)
        this.reconnectTimeout = null
      }
      this.callbacks.onConnected?.()
    })

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 WebSocket disconnected:', reason)
      this.isConnected = false
      this.callbacks.onDisconnected?.()

      // Always try to reconnect on disconnect unless it was manual
      if (reason !== 'io client disconnect') {
        this.scheduleReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      console.error('Error details:', {
        message: error.message,
      })

      // If this is a timeout error and we haven't tried direct connection yet
      if (error.message === 'timeout' && this.reconnectAttempts === 1) {
        console.log('🔧 Timeout detected, will try direct connection on next attempt')
      }

      this.callbacks.onError?.(error)
      this.scheduleReconnect()
    })

    // Game session events
    this.socket.on('session_started', (session: GameSessionEventData) => {
      console.log('📥 Received session_started event:', session)
      this.callbacks.onSessionStarted?.(session)
    })

    this.socket.on('session_ended', (session: GameSessionEventData) => {
      console.log('📥 Received session_ended event:', session)
      this.callbacks.onSessionEnded?.(session)
    })

    this.socket.on('session_updated', (session: GameSessionEventData) => {
      console.log('📥 Received session_updated event:', session)
      this.callbacks.onSessionUpdated?.(session)
    })

    this.socket.on('session_deleted', (data: { id: number }) => {
      console.log('📥 Received session_deleted event:', data)
      this.callbacks.onSessionDeleted?.(data)
    })

    this.socket.on('client_sessions_stopped', (data: { clientId: string; sessionIds: number[] }) => {
      console.log('📥 Received client_sessions_stopped event:', data)
      this.callbacks.onClientSessionsStopped?.(data)
    })


    this.socket.on('active_sessions_updated', (data: { sessions: GameSessionEventData[] }) => {
      console.log('📥 Received active_sessions_updated event:', data.sessions.length, 'sessions')
      this.callbacks.onActiveSessionsUpdated?.(data)
    })
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout)
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Switching to polling mode.')
      // Don't completely give up - the fallback system will handle polling
      return
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) // Exponential backoff, max 30s
    this.reconnectAttempts++

    console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`)

    this.reconnectTimeout = window.setTimeout(() => {
      console.log('🔄 Attempting to reconnect...')
      this.disconnect()
      this.connect()
    }, delay)
  }

  public setCallbacks(callbacks: WebSocketCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.isConnected = false
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true
  }

  public reconnect() {
    console.log('🔄 Manual reconnection requested')
    this.reconnectAttempts = 0
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    this.disconnect()
    this.connect()
  }

  // Utility method to emit custom events if needed
  public emit(event: string, data?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.warn('⚠️ Cannot emit event: WebSocket not connected')
    }
  }
}

// Create a singleton instance
export const webSocketManager = new WebSocketManager()

// Export default for easy importing
export default webSocketManager
