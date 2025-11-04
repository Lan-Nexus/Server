<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-primary/10 rounded-xl">
            <i class="fas fa-gamepad text-primary text-2xl"></i>
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Game Sessions
            </h1>
            <p class="text-base-content/60 mt-1">Manage and monitor game session activity</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            @click="refreshData" 
            :disabled="gameSessionsStore.isLoading"
            class="btn btn-ghost btn-sm gap-2"
          >
            <i class="fas fa-refresh" :class="{ 'animate-spin': gameSessionsStore.isLoading }"></i>
            Refresh
          </button>
          <button 
            @click="showCreateModal = true"
            class="btn btn-primary gap-2"
          >
            <i class="fas fa-plus"></i>
            New Session
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="stat bg-base-100/80 backdrop-blur-sm border border-base-300/20 rounded-xl shadow-sm">
        <div class="stat-figure text-primary">
          <i class="fas fa-play-circle text-3xl"></i>
        </div>
        <div class="stat-title">Active Sessions</div>
        <div class="stat-value text-primary">{{ gameSessionsStore.activeSessionCount }}</div>
        <div class="stat-desc">Currently playing</div>
      </div>
      
      <div class="stat bg-base-100/80 backdrop-blur-sm border border-base-300/20 rounded-xl shadow-sm">
        <div class="stat-figure text-secondary">
          <i class="fas fa-history text-3xl"></i>
        </div>
        <div class="stat-title">Total Sessions</div>
        <div class="stat-value text-secondary">{{ gameSessionsStore.sessionCount }}</div>
        <div class="stat-desc">All time</div>
      </div>
      
      <div class="stat bg-base-100/80 backdrop-blur-sm border border-base-300/20 rounded-xl shadow-sm">
        <div class="stat-figure text-accent">
          <i class="fas fa-users text-3xl"></i>
        </div>
        <div class="stat-title">Active Players</div>
        <div class="stat-value text-accent">{{ uniqueActivePlayers }}</div>
        <div class="stat-desc">Online now</div>
      </div>
      
      <div class="stat bg-base-100/80 backdrop-blur-sm border border-base-300/20 rounded-xl shadow-sm">
        <div class="stat-figure text-warning">
          <i class="fas fa-clock text-3xl"></i>
        </div>
        <div class="stat-title">Avg Session</div>
        <div class="stat-value text-warning text-2xl">{{ averageSessionTime }}</div>
        <div class="stat-desc">Duration</div>
      </div>
    </div>

    <!-- Filter and Search -->
    <div class="bg-base-100/80 backdrop-blur-sm border border-base-300/20 rounded-xl p-6 mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="form-control">
          <input 
            type="text" 
            placeholder="Search by Client ID..." 
            class="input input-bordered w-64"
            v-model="searchQuery"
          />
        </div>
        
        <div class="form-control">
          <select class="select select-bordered" v-model="statusFilter">
            <option value="">All Sessions</option>
            <option value="active">Active Only</option>
            <option value="ended">Ended Only</option>
          </select>
        </div>
        
        <div class="form-control">
          <select class="select select-bordered" v-model="gameFilter">
            <option value="">All Games</option>
            <option v-for="game in gamesStore.games" :key="game.id" :value="game.id">
              {{ game.name }}
            </option>
          </select>
        </div>
        
        <button 
          @click="clearFilters" 
          class="btn btn-ghost btn-sm"
          v-if="searchQuery || statusFilter || gameFilter"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Active Sessions Section -->
    <div class="bg-base-100/80 backdrop-blur-sm border border-base-300/20 rounded-xl mb-6">
      <div class="p-6 border-b border-base-300/20">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <i class="fas fa-circle text-success animate-pulse"></i>
          Active Sessions
        </h2>
      </div>
      
      <div class="p-6">
        <div v-if="gameSessionsStore.isLoading" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
        
        <div v-else-if="filteredActiveSessions.length === 0" class="text-center py-8 text-base-content/60">
          <i class="fas fa-inbox text-4xl mb-4 opacity-50"></i>
          <p>No active sessions found</p>
        </div>
        
        <div v-else class="grid gap-4">
          <div 
            v-for="session in filteredActiveSessions" 
            :key="session.id"
            class="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg"
          >
            <div class="flex items-center gap-4">
              <div class="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <div>
                <div class="font-medium">{{ session.clientId }}</div>
                <div class="text-sm text-base-content/60">
                  Game: {{ getGameName(session.gameId) }}
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-sm font-medium">{{ formatTime(session.startTime) }}</div>
                <div class="text-xs text-base-content/60">
                  {{ gameSessionsStore.formatDuration(gameSessionsStore.calculateSessionDuration(session)) }}
                </div>
              </div>
              
              <div class="flex gap-2">
                <button 
                  @click="stopSession(session.id)"
                  class="btn btn-sm btn-error gap-1"
                  :disabled="gameSessionsStore.isLoading"
                >
                  <i class="fas fa-stop text-xs"></i>
                  Stop
                </button>
                <button 
                  @click="viewSession(session)"
                  class="btn btn-sm btn-ghost gap-1"
                >
                  <i class="fas fa-eye text-xs"></i>
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Sessions Table -->
    <div class="bg-base-100/80 backdrop-blur-sm border border-base-300/20 rounded-xl">
      <div class="p-6 border-b border-base-300/20">
        <h2 class="text-xl font-semibold">All Sessions</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Game</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="session in paginatedSessions" :key="session.id">
              <td>
                <div class="font-medium">{{ session.clientId }}</div>
              </td>
              <td>{{ getGameName(session.gameId) }}</td>
              <td>{{ formatTime(session.startTime) }}</td>
              <td>
                {{ session.endTime ? formatTime(session.endTime) : '-' }}
              </td>
              <td>
                {{ session.endTime 
                  ? gameSessionsStore.formatDuration(gameSessionsStore.calculateSessionDuration(session))
                  : gameSessionsStore.formatDuration(gameSessionsStore.calculateSessionDuration(session)) + ' (ongoing)'
                }}
              </td>
              <td>
                <div class="badge" :class="session.isActive ? 'badge-success' : 'badge-ghost'">
                  {{ session.isActive ? 'Active' : 'Ended' }}
                </div>
              </td>
              <td>
                <div class="flex gap-1">
                  <button 
                    @click="viewSession(session)"
                    class="btn btn-xs btn-ghost"
                    title="View Details"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    @click="editSession(session)"
                    class="btn btn-xs btn-ghost"
                    title="Edit"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    v-if="session.isActive"
                    @click="stopSession(session.id)"
                    class="btn btn-xs btn-error"
                    title="Stop Session"
                    :disabled="gameSessionsStore.isLoading"
                  >
                    <i class="fas fa-stop"></i>
                  </button>
                  <button 
                    @click="deleteSession(session.id)"
                    class="btn btn-xs btn-error"
                    title="Delete"
                    :disabled="gameSessionsStore.isLoading"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="p-6 border-t border-base-300/20">
        <div class="flex items-center justify-between">
          <div class="text-sm text-base-content/60">
            Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, filteredSessions.length) }} of {{ filteredSessions.length }} sessions
          </div>
          
          <div class="btn-group">
            <button 
              class="btn btn-sm" 
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="btn btn-sm btn-active">{{ currentPage }}</button>
            <button 
              class="btn btn-sm" 
              :disabled="currentPage >= totalPages"
              @click="currentPage++"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Session Modal -->
    <input type="checkbox" id="create-modal" class="modal-toggle" v-model="showCreateModal" />
    <div class="modal" role="dialog">
      <div class="modal-box max-w-2xl bg-base-100/95 backdrop-blur-sm border border-base-300/20">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-base-300/20">
          <h3 class="text-xl font-bold">Create Game Session</h3>
          <label for="create-modal" class="btn btn-sm btn-circle btn-ghost">✕</label>
        </div>
        
        <form @submit.prevent="handleCreateSession" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Client ID</span>
            </label>
            <input 
              type="text" 
              v-model="newSession.clientId"
              class="input input-bordered" 
              required 
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Game</span>
            </label>
            <select v-model="newSession.gameId" class="select select-bordered" required>
              <option value="">Select a game</option>
              <option v-for="game in gamesStore.games" :key="game.id" :value="game.id">
                {{ game.name }}
              </option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Start Time</span>
            </label>
            <input 
              type="datetime-local" 
              v-model="newSession.startTime"
              class="input input-bordered" 
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">End Time (optional)</span>
            </label>
            <input 
              type="datetime-local" 
              v-model="newSession.endTime"
              class="input input-bordered" 
            />
          </div>
          
          <div class="modal-action">
            <button type="button" @click="showCreateModal = false" class="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="gameSessionsStore.isLoading">
              <span v-if="gameSessionsStore.isLoading" class="loading loading-spinner loading-sm"></span>
              Create Session
            </button>
          </div>
        </form>
      </div>
      <label class="modal-backdrop" for="create-modal">Close</label>
    </div>

    <!-- View Session Modal -->
    <input type="checkbox" id="view-modal" class="modal-toggle" v-model="showViewModal" />
    <div class="modal" role="dialog">
      <div class="modal-box max-w-2xl bg-base-100/95 backdrop-blur-sm border border-base-300/20">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-base-300/20">
          <h3 class="text-xl font-bold">Session Details</h3>
          <label for="view-modal" class="btn btn-sm btn-circle btn-ghost">✕</label>
        </div>
        
        <div v-if="viewingSession" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-medium">Session ID</span>
              </label>
              <div class="text-lg">{{ viewingSession.id }}</div>
            </div>
            
            <div>
              <label class="label">
                <span class="label-text font-medium">Status</span>
              </label>
              <div class="badge" :class="viewingSession.isActive ? 'badge-success' : 'badge-ghost'">
                {{ viewingSession.isActive ? 'Active' : 'Ended' }}
              </div>
            </div>
          </div>
          
          <div>
            <label class="label">
              <span class="label-text font-medium">Client ID</span>
            </label>
            <div class="text-lg">{{ viewingSession.clientId }}</div>
          </div>
          
          <div>
            <label class="label">
              <span class="label-text font-medium">Game</span>
            </label>
            <div class="text-lg">{{ getGameName(viewingSession.gameId) }}</div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-medium">Start Time</span>
              </label>
              <div>{{ formatTime(viewingSession.startTime) }}</div>
            </div>
            
            <div>
              <label class="label">
                <span class="label-text font-medium">End Time</span>
              </label>
              <div>{{ viewingSession.endTime ? formatTime(viewingSession.endTime) : 'Ongoing' }}</div>
            </div>
          </div>
          
          <div>
            <label class="label">
              <span class="label-text font-medium">Duration</span>
            </label>
            <div class="text-lg">
              {{ gameSessionsStore.formatDuration(gameSessionsStore.calculateSessionDuration(viewingSession)) }}
              {{ viewingSession.isActive ? '(ongoing)' : '' }}
            </div>
          </div>
        </div>
        
        <div class="modal-action">
          <label for="view-modal" class="btn btn-ghost">Close</label>
        </div>
      </div>
      <label class="modal-backdrop" for="view-modal">Close</label>
    </div>

    <!-- Toast Notifications -->
    <div v-if="showSuccessToast" class="toast toast-top toast-end z-50">
      <div class="alert alert-success shadow-xl border border-success/20">
        <i class="fas fa-check-circle text-success shrink-0 h-6 w-6"></i>
        <span class="font-medium">{{ successMessage }}</span>
      </div>
    </div>

    <div v-if="showErrorToast" class="toast toast-top toast-end z-50">
      <div class="alert alert-error shadow-xl border border-error/20">
        <i class="fas fa-exclamation-circle text-error shrink-0 h-6 w-6"></i>
        <span class="font-medium">{{ errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameSessionsStore, type CreateGameSessionType, type GameSession } from '@/stores/gameSessions'
import { useGamesStore } from '@/stores/games'

const gameSessionsStore = useGameSessionsStore()
const gamesStore = useGamesStore()

// UI State
const showCreateModal = ref(false)
const showViewModal = ref(false)
const viewingSession = ref<GameSession | null>(null)

// Filters and Search
const searchQuery = ref('')
const statusFilter = ref('')
const gameFilter = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = ref(20)

// Form data
const newSession = ref<CreateGameSessionType>({
  clientId: '',
  gameId: 0,
  startTime: '',
  endTime: ''
})

// Toast notifications
const showSuccessToast = ref(false)
const showErrorToast = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Auto-refresh interval
let refreshInterval: NodeJS.Timeout | null = null

// Computed properties
const uniqueActivePlayers = computed(() => {
  const clientIds = new Set(gameSessionsStore.activeSessions.map(s => s.clientId))
  return clientIds.size
})

const averageSessionTime = computed(() => {
  const endedSessions = gameSessionsStore.sessions.filter(s => !s.isActive && s.endTime)
  if (endedSessions.length === 0) return '0m'
  
  const totalDuration = endedSessions.reduce((sum, session) => {
    return sum + gameSessionsStore.calculateSessionDuration(session)
  }, 0)
  
  const avgSeconds = Math.floor(totalDuration / endedSessions.length)
  return gameSessionsStore.formatDuration(avgSeconds)
})

const filteredSessions = computed(() => {
  let filtered = [...gameSessionsStore.sessions]
  
  if (searchQuery.value) {
    filtered = filtered.filter(session => 
      session.clientId.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (statusFilter.value === 'active') {
    filtered = filtered.filter(session => session.isActive === 1)
  } else if (statusFilter.value === 'ended') {
    filtered = filtered.filter(session => session.isActive === 0)
  }
  
  if (gameFilter.value) {
    filtered = filtered.filter(session => session.gameId === parseInt(gameFilter.value))
  }
  
  return filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
})

const filteredActiveSessions = computed(() => {
  let filtered = [...gameSessionsStore.activeSessions]
  
  if (searchQuery.value) {
    filtered = filtered.filter(session => 
      session.clientId.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (gameFilter.value) {
    filtered = filtered.filter(session => session.gameId === parseInt(gameFilter.value))
  }
  
  return filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
})

const totalPages = computed(() => Math.ceil(filteredSessions.value.length / pageSize.value))

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSessions.value.slice(start, end)
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

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  gameFilter.value = ''
  currentPage.value = 1
}

function viewSession(session: GameSession) {
  viewingSession.value = session
  showViewModal.value = true
}

function editSession(session: GameSession) {
  // TODO: Implement edit functionality
  showToast('Edit functionality coming soon!', true)
}

async function stopSession(sessionId: number) {
  try {
    await gameSessionsStore.stopSession(sessionId)
    showToast('Session stopped successfully!')
  } catch (error: any) {
    showToast(error.message || 'Failed to stop session', true)
  }
}

async function deleteSession(sessionId: number) {
  if (!confirm('Are you sure you want to delete this session?')) return
  
  try {
    await gameSessionsStore.deleteSession(sessionId)
    showToast('Session deleted successfully!')
  } catch (error: any) {
    showToast(error.message || 'Failed to delete session', true)
  }
}

async function handleCreateSession() {
  try {
    const sessionData = { ...newSession.value }
    
    // Convert datetime-local values to ISO strings
    if (sessionData.startTime) {
      sessionData.startTime = new Date(sessionData.startTime).toISOString()
    }
    if (sessionData.endTime) {
      sessionData.endTime = new Date(sessionData.endTime).toISOString()
    }
    
    await gameSessionsStore.createSession(sessionData)
    showCreateModal.value = false
    resetNewSession()
    showToast('Session created successfully!')
  } catch (error: any) {
    showToast(error.message || 'Failed to create session', true)
  }
}

function resetNewSession() {
  newSession.value = {
    clientId: '',
    gameId: 0,
    startTime: '',
    endTime: ''
  }
}

async function refreshData() {
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
    
    console.log('🎉 Data refresh completed successfully')
  } catch (error: any) {
    console.error('❌ Failed to refresh data:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    showToast('Failed to refresh data: ' + (error.message || 'Unknown error'), true)
  }
}

function showToast(message: string, isError = false) {
  if (isError) {
    errorMessage.value = message
    showErrorToast.value = true
    setTimeout(() => {
      showErrorToast.value = false
    }, 3000)
  } else {
    successMessage.value = message
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
  }
}

// Auto-refresh active sessions every 30 seconds
function startAutoRefresh() {
  refreshInterval = setInterval(async () => {
    try {
      await gameSessionsStore.fetchActiveSessions()
    } catch (error) {
      console.error('Auto-refresh failed:', error)
    }
  }, 30000)
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
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