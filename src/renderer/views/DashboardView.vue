<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-8 flex flex-col">
    <!-- Dashboard Header -->
    <DashboardHeader :countdown="countdown" />

    <!-- Now and Next Header -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Now Section -->
      <EventBanner
        title="NOW"
        :event="activeEvent"
        :players="activeEventPlayers"
        :time-text="activeEvent ? getEventTimeRemaining(typeof activeEvent.endTime === 'string' ? activeEvent.endTime : activeEvent.endTime.toISOString()) + ' remaining' : ''"
        empty-text="No active event"
        players-label="Playing now"
        variant="now"
      />

      <!-- Next Section -->
      <EventBanner
        title="NEXT"
        :event="nextEvent"
        :players="nextEventPlayers"
        :time-text="nextEvent ? formatRelativeTime(typeof nextEvent.startTime === 'string' ? nextEvent.startTime : nextEvent.startTime.toISOString()) : ''"
        empty-text="No upcoming events"
        players-label="Currently playing"
        variant="next"
      />
    </div>



    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 flex-1">
      <!-- Active Sessions -->
      <ActiveSessionsCard
        :active-sessions="activeSessions"
        :is-loading="isLoading"
        :get-user-for-session="getUserForSession"
        :get-game-name="getGameName"
        :format-session-duration="formatSessionDuration"
      />

      <!-- Popular Games Today -->
      <PopularGamesCard
        title="Popular Games Today"
        :games="popularGames"
        :is-loading="isLoading"
        empty-message="No games today"
        variant="today"
        :get-game-icon="getGameIcon"
        :format-duration="formatDuration"
      />

      <!-- Popular Games Last 30 Days -->
      <PopularGamesCard
        title="Popular This Event"
        :games="popularGamesLast30Days"
        :is-loading="isLoading"
        empty-message="No games played"
        variant="period"
        :get-game-icon="getGameIcon"
        :format-duration="formatDuration"
      />

      <!-- Upcoming Events -->
      <UpcomingEventsCard
        :events="upcomingEvents"
        :is-loading="eventsStore.isLoading"
        :format-event-time="formatEventTime"
        :format-relative-time="formatRelativeTime"
      />
    </div>

    <!-- Connection Status -->
    <ConnectionStatus :connection-status="connectionStatus" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameSessionsStore, type GameSession } from '@/stores/gameSessions'
import { useGamesStore } from '@/stores/games'
import { useUsersStore } from '@/stores/users'
import { useEventsStore, computeEventStatus } from '@/stores/events'
import { useFullscreenStore } from '@/stores/fullscreen'
import UserAvatar from '@/components/common/UserAvatar.vue'
import {
  EventBanner,
  DashboardHeader,
  ActiveSessionsCard,
  PopularGamesCard,
  UpcomingEventsCard,
  ConnectionStatus
} from '@/components/dashboard'

const gameSessionsStore = useGameSessionsStore()
const gamesStore = useGamesStore()
const usersStore = useUsersStore()
const eventsStore = useEventsStore()
const fullscreenStore = useFullscreenStore()

// State
const isLoading = ref(false)
const connectionStatus = ref<'connected' | 'disconnected'>('connected')
const countdown = ref(30)

// Auto-refresh intervals
let refreshInterval: number | null = null
let countdownInterval: number | null = null

// Computed properties
const activeSessions = computed(() => gameSessionsStore.activeSessions)

const activePlayerCount = computed(() => {
  const uniquePlayers = new Set(activeSessions.value.map(s => s.clientId))
  return uniquePlayers.size
})

const activeGameCount = computed(() => {
  const uniqueGames = new Set(activeSessions.value.map(s => s.gameId))
  return uniqueGames.size
})

const playerStatusText = computed(() => {
  const count = activePlayerCount.value
  if (count === 0) return 'All quiet'
  if (count === 1) return 'Gaming solo'
  return 'Gaming together'
})

const gameStatusText = computed(() => {
  const count = activeGameCount.value
  if (count === 0) return 'No games active'
  if (count === 1) return 'One game active'
  return 'Multiple games'
})

const todaySessionCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return gameSessionsStore.sessions.filter(session => {
    const sessionDate = new Date(session.startTime)
    return sessionDate >= today
  }).length
})

const sessionTrendText = computed(() => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterdayCount = gameSessionsStore.sessions.filter(session => {
    const sessionDate = new Date(session.startTime)
    return sessionDate >= yesterday && sessionDate < today
  }).length

  const todayCount = todaySessionCount.value

  if (yesterdayCount === 0) return todayCount > 0 ? 'First sessions!' : 'No activity'

  const change = todayCount - yesterdayCount
  if (change > 0) return `+${change} from yesterday`
  if (change < 0) return `${change} from yesterday`
  return 'Same as yesterday'
})

const averageSessionTime = computed(() => {
  const endedSessions = gameSessionsStore.sessions.filter(s => !s.isActive && s.endTime)
  if (endedSessions.length === 0) return '0m'

  const totalDuration = endedSessions.reduce((sum, session) => {
    return sum + calculateSessionDuration(session)
  }, 0)

  const avgSeconds = Math.floor(totalDuration / endedSessions.length)
  return formatDuration(avgSeconds)
})

const popularGames = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySessions = gameSessionsStore.sessions.filter(session => {
    const sessionDate = new Date(session.startTime)
    return sessionDate >= today
  })

  const gameStats: Record<number, {
    gameId: number
    name: string
    sessionCount: number
    totalTime: number
  }> = {}

  todaySessions.forEach(session => {
    if (!gameStats[session.gameId]) {
      gameStats[session.gameId] = {
        gameId: session.gameId,
        name: getGameName(session.gameId),
        sessionCount: 0,
        totalTime: 0
      }
    }

    gameStats[session.gameId].sessionCount++
    gameStats[session.gameId].totalTime += calculateSessionDuration(session)
  })

  return Object.values(gameStats)
    .sort((a, b) => b.sessionCount - a.sessionCount || b.totalTime - a.totalTime)
    .slice(0, 5)
})

const popularGamesLast30Days = computed(() => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const recentSessions = gameSessionsStore.sessions.filter(session => {
    const sessionDate = new Date(session.startTime)
    return sessionDate >= thirtyDaysAgo
  })

  const gameStats: Record<number, {
    gameId: number
    name: string
    sessionCount: number
    totalTime: number
  }> = {}

  recentSessions.forEach(session => {
    if (!gameStats[session.gameId]) {
      gameStats[session.gameId] = {
        gameId: session.gameId,
        name: getGameName(session.gameId),
        sessionCount: 0,
        totalTime: 0
      }
    }

    gameStats[session.gameId].sessionCount++
    gameStats[session.gameId].totalTime += calculateSessionDuration(session)
  })

  return Object.values(gameStats)
    .sort((a, b) => b.sessionCount - a.sessionCount || b.totalTime - a.totalTime)
    .slice(0, 5)
})

const activeEvent = computed(() => {
  return eventsStore.events.find(event => {
    const computedStatus = computeEventStatus(event.startTime, event.endTime, event.status)
    return computedStatus === 'active'
  })
})

const upcomingEvents = computed(() => {
  return eventsStore.events.filter(event => {
    const computedStatus = computeEventStatus(event.startTime, event.endTime, event.status)
    return computedStatus === 'upcoming'
  }).sort((a, b) => {
    const aTime = new Date(a.startTime).getTime()
    const bTime = new Date(b.startTime).getTime()
    return aTime - bTime
  })
})

const nextEvent = computed(() => {
  return upcomingEvents.value[0] || null
})

const activeEventPlayers = computed(() => {
  if (!activeEvent.value) return []
  
  // Get all active sessions for the current event's game
  const eventGameSessions = gameSessionsStore.activeSessions.filter(
    session => session.gameId === activeEvent.value?.gameId
  )
  
  // Get user info for each session
  return eventGameSessions.map(session => ({
    clientId: session.clientId,
    name: getUserForSession(session)?.name,
    avatar: getUserForSession(session)?.avatar
  }))
})

const nextEventPlayers = computed(() => {
  if (!nextEvent.value) return []
  
  // Get all active sessions for the next event's game
  const eventGameSessions = gameSessionsStore.activeSessions.filter(
    session => session.gameId === nextEvent.value?.gameId
  )
  
  // Get user info for each session
  return eventGameSessions.map(session => ({
    clientId: session.clientId,
    name: getUserForSession(session)?.name,
    avatar: getUserForSession(session)?.avatar
  }))
})

const recentSessions = computed(() => {
  const recent = [...gameSessionsStore.sessions]
    .sort((a, b) => {
      const aTime = a.endTime || a.startTime
      const bTime = b.endTime || b.startTime
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
    .slice(0, 10)

  return recent
})

// Methods
function getUserForSession(session: any) {
  return gameSessionsStore.getUserForSession(session)
}

function getGameIcon(gameId: number): string | undefined {
  const game = gamesStore.games.find(g => g.id === gameId)
  return game?.icon
}

function getGameName(gameId: number): string {
  if (!gamesStore.games || gamesStore.games.length === 0) {
    console.warn('⚠️ No games loaded in store')
    return `Game #${gameId}`
  }

  const game = gamesStore.games.find(g => g.id === gameId)
  if (!game) {
    console.warn(`⚠️ Game with ID ${gameId} not found in store`)
    return `Game #${gameId}`
  }

  return game.name
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  return `${minutes}m`
}

function formatSessionDuration(session: GameSession): string {
  const duration = calculateSessionDuration(session)
  return formatDuration(duration)
}

function calculateSessionDuration(session: GameSession): number {
  const startTime = new Date(session.startTime)
  const endTime = session.endTime ? new Date(session.endTime) : new Date()
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
}

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000)

  // For future events (positive difference)
  if (diffInSeconds > 0) {
    if (diffInSeconds < 3600) return `in ${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `in ${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `in ${Math.floor(diffInSeconds / 86400)}d`
    return date.toLocaleDateString()
  }

  // For past events (negative difference)
  const pastSeconds = Math.abs(diffInSeconds)
  if (pastSeconds < 60) return 'just now'
  if (pastSeconds < 3600) return `${Math.floor(pastSeconds / 60)}m ago`
  if (pastSeconds < 86400) return `${Math.floor(pastSeconds / 3600)}h ago`

  return date.toLocaleDateString()
}

function formatEventTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getEventTimeRemaining(endTime: string): string {
  const now = new Date()
  const end = new Date(endTime)
  const diffInSeconds = Math.floor((end.getTime() - now.getTime()) / 1000)

  if (diffInSeconds <= 0) return 'Event ended'

  const hours = Math.floor(diffInSeconds / 3600)
  const minutes = Math.floor((diffInSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}



async function refreshData() {
  isLoading.value = true
  try {
    console.log('🔄 Starting data refresh...')

    // Fetch users first
    console.log('👥 Fetching users...')
    await usersStore.fetchUsers()
    console.log('✅ Users loaded:', usersStore.users.length)

    // Fetch games
    console.log('📁 Fetching games...')
    await gamesStore.getGames()
    console.log('✅ Games loaded:', gamesStore.games.length)

    // Fetch events
    console.log('📅 Fetching events...')
    await eventsStore.fetchEvents()
    console.log('✅ Events loaded:', eventsStore.events.length)

    // Fetch game sessions
    console.log('🎮 Fetching all sessions...')
    await gameSessionsStore.fetchAllSessions()
    console.log('✅ All sessions loaded:', gameSessionsStore.sessions.length)

    console.log('🟢 Fetching active sessions...')
    await gameSessionsStore.fetchActiveSessions()
    console.log('✅ Active sessions loaded:', gameSessionsStore.activeSessions.length)

    connectionStatus.value = 'connected'
    console.log('🎉 Data refresh completed successfully')
  } catch (error) {
    console.error('❌ Failed to refresh data:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    connectionStatus.value = 'disconnected'
  } finally {
    isLoading.value = false
  }
}

function startAutoRefresh() {
  // Refresh data every 30 seconds
  refreshInterval = setInterval(async () => {
    await refreshData()
    countdown.value = 30 // Reset countdown
  }, 30000)

  // Update countdown every second
  countdownInterval = setInterval(() => {
    countdown.value = Math.max(0, countdown.value - 1)
  }, 1000)
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }

  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

// Lifecycle
onMounted(async () => {
  await refreshData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
/* Custom animations for the dashboard */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat {
  animation: fadeInUp 0.6s ease-out;
}

.stat:nth-child(2) {
  animation-delay: 0.1s;
}

.stat:nth-child(3) {
  animation-delay: 0.2s;
}

.stat:nth-child(4) {
  animation-delay: 0.3s;
}

/* Smooth transitions for live updates */
.transition-all {
  transition: all 0.3s ease;
}

/* Enhance the live indicator */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.8);
  }
}

.animate-pulse {
  animation: pulse-glow 2s infinite;
}
</style>
