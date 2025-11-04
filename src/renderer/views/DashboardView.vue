<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-8">
    <!-- Header with Auto-refresh Indicator -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <div class="p-4 bg-primary/10 rounded-2xl">
          <i class="fas fa-tv text-primary text-3xl"></i>
        </div>
        <div>
          <h1 class="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gaming Dashboard
          </h1>
          <p class="text-xl text-base-content/60 mt-2">Live activity monitor</p>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-lg">
          <div class="w-3 h-3 bg-success rounded-full animate-pulse"></div>
          <span class="text-base-content/80">LIVE</span>
        </div>
        <div class="text-right text-base-content/60">
          <div class="text-sm">Next update in</div>
          <div class="text-2xl font-mono">{{ countdown }}s</div>
        </div>
      </div>
    </div>

    <!-- Main Stats Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
      <!-- Active Players -->
      <div class="stat bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 shadow-lg">
        <div class="stat-figure text-primary">
          <i class="fas fa-users text-5xl"></i>
        </div>
        <div class="stat-title text-lg opacity-80">Active Players</div>
        <div class="stat-value text-primary text-6xl font-bold">{{ activePlayerCount }}</div>
        <div class="stat-desc text-lg">{{ playerStatusText }}</div>
      </div>
      
      <!-- Active Games -->
      <div class="stat bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-2xl p-6 shadow-lg">
        <div class="stat-figure text-secondary">
          <i class="fas fa-gamepad text-5xl"></i>
        </div>
        <div class="stat-title text-lg opacity-80">Games Playing</div>
        <div class="stat-value text-secondary text-6xl font-bold">{{ activeGameCount }}</div>
        <div class="stat-desc text-lg">{{ gameStatusText }}</div>
      </div>
      
      <!-- Total Sessions Today -->
      <div class="stat bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-6 shadow-lg">
        <div class="stat-figure text-accent">
          <i class="fas fa-chart-line text-5xl"></i>
        </div>
        <div class="stat-title text-lg opacity-80">Sessions Today</div>
        <div class="stat-value text-accent text-6xl font-bold">{{ todaySessionCount }}</div>
        <div class="stat-desc text-lg">{{ sessionTrendText }}</div>
      </div>
      
      <!-- Average Session Time -->
      <div class="stat bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 rounded-2xl p-6 shadow-lg">
        <div class="stat-figure text-warning">
          <i class="fas fa-clock text-5xl"></i>
        </div>
        <div class="stat-title text-lg opacity-80">Avg Session</div>
        <div class="stat-value text-warning text-4xl font-bold">{{ averageSessionTime }}</div>
        <div class="stat-desc text-lg">Duration</div>
      </div>
    </div>

    <!-- Current Activity Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Active Sessions -->
      <div class="bg-base-100/90 backdrop-blur-sm border border-base-300/30 rounded-2xl shadow-xl">
        <div class="p-6 border-b border-base-300/30">
          <h2 class="text-2xl font-bold flex items-center gap-3">
            <i class="fas fa-circle text-success animate-pulse"></i>
            Currently Playing
          </h2>
        </div>
        
        <div class="p-6 max-h-96 overflow-y-auto">
          <div v-if="isLoading" class="flex justify-center py-12">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
          
          <div v-else-if="activeSessions.length === 0" class="text-center py-12 text-base-content/60">
            <i class="fas fa-bed text-6xl mb-4 opacity-30"></i>
            <p class="text-xl">No one is playing right now</p>
            <p class="text-sm mt-2">Check back later!</p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="session in activeSessions" 
              :key="session.id"
              class="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-xl hover:bg-success/10 transition-all duration-300"
            >
              <div class="flex items-center gap-4">
                <div class="w-4 h-4 bg-success rounded-full animate-pulse"></div>
                <div>
                  <div class="text-xl font-semibold">{{ session.clientId }}</div>
                  <div class="text-base-content/70 text-lg">
                    Playing: {{ getGameName(session.gameId) }}
                  </div>
                </div>
              </div>
              
              <div class="text-right">
                <div class="text-lg font-mono">{{ formatSessionDuration(session) }}</div>
                <div class="text-sm text-base-content/60">
                  Started {{ formatRelativeTime(session.startTime) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Popular Games Today -->
      <div class="bg-base-100/90 backdrop-blur-sm border border-base-300/30 rounded-2xl shadow-xl">
        <div class="p-6 border-b border-base-300/30">
          <h2 class="text-2xl font-bold flex items-center gap-3">
            <i class="fas fa-trophy text-warning"></i>
            Popular Games Today
          </h2>
        </div>
        
        <div class="p-6 max-h-96 overflow-y-auto">
          <div v-if="isLoading" class="flex justify-center py-12">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
          
          <div v-else-if="popularGames.length === 0" class="text-center py-12 text-base-content/60">
            <i class="fas fa-gamepad text-6xl mb-4 opacity-30"></i>
            <p class="text-xl">No games played today</p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="(game, index) in popularGames" 
              :key="game.gameId"
              class="flex items-center justify-between p-4 bg-base-200/50 rounded-xl"
            >
              <div class="flex items-center gap-4">
                <div class="text-2xl font-bold text-primary">
                  #{{ index + 1 }}
                </div>
                <div>
                  <div class="text-xl font-semibold">{{ game.name }}</div>
                  <div class="text-base-content/70">
                    {{ game.sessionCount }} session{{ game.sessionCount !== 1 ? 's' : '' }}
                  </div>
                </div>
              </div>
              
              <div class="text-right">
                <div class="text-lg font-bold">{{ formatDuration(game.totalTime) }}</div>
                <div class="text-sm text-base-content/60">Total playtime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Timeline -->
    <div class="bg-base-100/90 backdrop-blur-sm border border-base-300/30 rounded-2xl shadow-xl">
      <div class="p-6 border-b border-base-300/30">
        <h2 class="text-2xl font-bold flex items-center gap-3">
          <i class="fas fa-history text-info"></i>
          Recent Activity
        </h2>
      </div>
      
      <div class="p-6">
        <div v-if="isLoading" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
        
        <div v-else-if="recentSessions.length === 0" class="text-center py-8 text-base-content/60">
          <i class="fas fa-calendar-times text-4xl mb-4 opacity-30"></i>
          <p class="text-lg">No recent activity</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="session in recentSessions" 
            :key="session.id"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-base-200/50 transition-all duration-200"
          >
            <div class="flex items-center gap-4">
              <div 
                class="w-3 h-3 rounded-full"
                :class="session.isActive ? 'bg-success animate-pulse' : 'bg-base-300'"
              ></div>
              <div>
                <span class="font-semibold">{{ session.clientId }}</span>
                <span class="text-base-content/70 ml-2">
                  {{ session.isActive ? 'started playing' : 'finished playing' }}
                </span>
                <span class="font-medium ml-1">{{ getGameName(session.gameId) }}</span>
              </div>
            </div>
            
            <div class="text-right text-base-content/60">
              <div class="text-sm">{{ formatRelativeTime(session.isActive ? session.startTime : session.endTime!) }}</div>
              <div v-if="!session.isActive && session.endTime" class="text-xs">
                Played for {{ formatDuration(calculateSessionDuration(session)) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Connection Status -->
    <div class="fixed bottom-4 right-4">
      <div 
        class="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
        :class="connectionStatus === 'connected' ? 'bg-success text-success-content' : 'bg-error text-error-content'"
      >
        <div 
          class="w-2 h-2 rounded-full"
          :class="connectionStatus === 'connected' ? 'bg-success-content animate-pulse' : 'bg-error-content'"
        ></div>
        <span class="text-sm font-medium">
          {{ connectionStatus === 'connected' ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameSessionsStore, type GameSession } from '@/stores/gameSessions'
import { useGamesStore } from '@/stores/games'

const gameSessionsStore = useGameSessionsStore()
const gamesStore = useGamesStore()

// State
const isLoading = ref(false)
const connectionStatus = ref<'connected' | 'disconnected'>('connected')
const countdown = ref(30)

// Auto-refresh intervals
let refreshInterval: NodeJS.Timeout | null = null
let countdownInterval: NodeJS.Timeout | null = null

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
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 5)
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
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  
  return date.toLocaleDateString()
}

async function refreshData() {
  isLoading.value = true
  try {
    console.log('🔄 Starting data refresh...')
    
    // Fetch games first
    console.log('📁 Fetching games...')
    await gamesStore.getGames()
    console.log('✅ Games loaded:', gamesStore.games.length)
    
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