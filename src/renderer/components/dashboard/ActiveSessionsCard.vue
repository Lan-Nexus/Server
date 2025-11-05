<template>
  <div class="bg-base-100/90 backdrop-blur-sm border border-base-300/30 rounded-2xl shadow-xl flex flex-col">
    <div class="p-4 border-b border-base-300/30">
      <h2 class="text-xl font-bold flex items-center gap-2">
        <i class="fas fa-circle text-success animate-pulse"></i>
        Currently Playing
        <div class="ml-auto flex items-center gap-2">
          <div v-if="isWebSocketConnected" class="flex items-center gap-1 text-xs text-success">
            <i class="fas fa-bolt"></i>
            <span>Live</span>
          </div>
          <div v-else class="flex items-center gap-1 text-xs text-warning">
            <i class="fas fa-clock"></i>
            <span>Polling</span>
          </div>
        </div>
      </h2>
    </div>

    <div class="p-4 flex-1 overflow-y-auto">
      <div v-if="isLoading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-md text-primary"></span>
      </div>

      <div v-else-if="activeSessions.length === 0" class="text-center py-8 text-base-content/60">
        <i class="fas fa-bed text-4xl mb-3 opacity-30"></i>
        <p class="text-lg">No one is playing</p>
        <p class="text-xs mt-1">Check back later!</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="session in activeSessions"
          :key="session.id"
          class="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg hover:bg-success/10 transition-all duration-300"
        >
          <div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <UserAvatar
            :name="getUserForSession(session)?.name || session.clientId"
            size="xs"
            :hover="false"
            :avatar="getUserForSession(session)?.avatar || undefined"
          />
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{{ getUserForSession(session)?.name || session.clientId }}</div>
            <div class="text-xs text-base-content/70 truncate">
              {{ getGameName(session.gameId) }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs font-mono">{{ formatSessionDuration(session) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from '@/components/common/UserAvatar.vue'
import type { GameSession } from '@/stores/gameSessions'
import type { User } from '@/stores/users'

interface Props {
  activeSessions: GameSession[]
  isLoading: boolean
  getUserForSession: (session: GameSession) => User | undefined
  getGameName: (gameId: number) => string
  formatSessionDuration: (session: GameSession) => string
  isWebSocketConnected?: boolean
}

defineProps<Props>()
</script>
