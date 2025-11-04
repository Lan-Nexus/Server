<template>
  <div class="bg-base-100/90 backdrop-blur-sm border border-base-300/30 rounded-2xl shadow-xl flex flex-col">
    <div class="p-4 border-b border-base-300/30">
      <h2 class="text-xl font-bold flex items-center gap-2">
        <i :class="iconClass"></i>
        {{ title }}
      </h2>
    </div>

    <div class="p-4 flex-1 overflow-y-auto">
      <div v-if="isLoading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-md text-primary"></span>
      </div>

      <div v-else-if="games.length === 0" class="text-center py-8 text-base-content/60">
        <i class="fas fa-gamepad text-4xl mb-3 opacity-30"></i>
        <p class="text-lg">{{ emptyMessage }}</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(game, index) in games"
          :key="game.gameId"
          class="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg"
        >
          <div class="avatar">
            <div :class="gameIconClasses">
              <img
                v-if="getGameIcon(game.gameId)"
                :src="getGameIcon(game.gameId)"
                :alt="`${game.name} icon`"
                class="w-full h-full rounded-lg object-cover"
                @error="(e) => (e.target as HTMLImageElement).style.display='none'"
              />
              <div
                v-else
                :class="fallbackIconClasses"
              >
                <i :class="fallbackGamepadClasses"></i>
              </div>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <div class="font-medium truncate">{{ game.name }}</div>
              <div :class="badgeClasses">#{{ index + 1 }}</div>
            </div>
            <div class="text-xs text-base-content/70">
              {{ game.sessionCount }} session{{ game.sessionCount !== 1 ? 's' : '' }}
            </div>
          </div>
          <div class="text-xs font-bold">{{ formatDuration(game.totalTime) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface PopularGame {
  gameId: number
  name: string
  sessionCount: number
  totalTime: number
}

interface Props {
  title: string
  games: PopularGame[]
  isLoading: boolean
  emptyMessage?: string
  variant?: 'today' | 'period'
  getGameIcon: (gameId: number) => string | undefined
  formatDuration: (duration: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  emptyMessage: 'No games played',
  variant: 'today'
})

// Computed classes based on variant
const iconClass = computed(() => {
  return props.variant === 'today' 
    ? 'fas fa-trophy text-warning'
    : 'fas fa-chart-line text-accent'
})

const gameIconClasses = computed(() => {
  const baseClasses = 'w-8 h-8 rounded-lg ring-1 bg-base-200'
  return props.variant === 'today'
    ? `${baseClasses} ring-primary/20`
    : `${baseClasses} ring-accent/20`
})

const fallbackIconClasses = computed(() => {
  const baseClasses = 'w-full h-full rounded-lg bg-gradient-to-br to-secondary/20 flex items-center justify-center'
  return props.variant === 'today'
    ? `${baseClasses} from-primary/20`
    : `${baseClasses} from-accent/20`
})

const fallbackGamepadClasses = computed(() => {
  const baseClasses = 'fas fa-gamepad text-xs'
  return props.variant === 'today'
    ? `${baseClasses} text-primary`
    : `${baseClasses} text-accent`
})

const badgeClasses = computed(() => {
  const baseClasses = 'badge badge-xs'
  return props.variant === 'today'
    ? `${baseClasses} badge-primary`
    : `${baseClasses} badge-accent`
})
</script>