<template>
  <div :class="containerClasses">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <!-- Game Icon or Fallback -->
        <div v-if="event" class="avatar">
          <div :class="iconClasses">
            <img
              v-if="event.gameIcon"
              :src="event.gameIcon"
              :alt="`${event.gameName} icon`"
              class="w-full h-full rounded-xl object-cover"
              @error="(e) => (e.target as HTMLImageElement).style.display='none'"
            />
            <div
              v-else
              :class="fallbackIconClasses"
            >
              <i :class="gamepadIconClasses"></i>
            </div>
          </div>
        </div>
        <div v-else :class="emptyIconContainerClasses">
          <i :class="emptyIconClasses"></i>
        </div>

        <div>
          <h2 :class="titleClasses">{{ title }}</h2>
          <div v-if="event" class="space-y-3">
            <div class="flex items-center gap-3">
              <div>
                <div class="text-xl font-bold">{{ event.gameName }}</div>
                <div class="text-sm text-base-content/70">{{ timeText }}</div>
              </div>
            </div>
            
            <!-- Players in this game - Always rendered to maintain consistent height -->
            <div class="flex items-center gap-2 min-h-[2rem]">
              <div v-if="players.length > 0" class="flex items-center gap-2">
                <span class="text-sm text-base-content/70">{{ playersLabel }}:</span>
                <div class="flex -space-x-2">
                  <div
                    v-for="player in players.slice(0, 5)"
                    :key="player.clientId"
                    class="avatar"
                  >
                    <UserAvatar
                      :name="player.name || player.clientId"
                      size="sm"
                      :hover="false"
                      :avatar="player.avatar || undefined"
                    />
                  </div>
                  <div
                    v-if="players.length > 5"
                    class="avatar"
                  >
                    <div class="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
                      <span class="text-sm font-bold">+{{ players.length - 5 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-base-content/60">
            {{ emptyText }}
          </div>
        </div>
      </div>

      <!-- Optional slot for additional content (like fullscreen button) -->
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import type { GameEvent } from '@/stores/events'

interface Player {
  clientId: string
  name?: string
  avatar?: any
}

interface Props {
  title: string
  event?: GameEvent | null
  players?: Player[]
  timeText?: string
  emptyText?: string
  playersLabel?: string
  variant?: 'now' | 'next'
}

const props = withDefaults(defineProps<Props>(), {
  players: () => [],
  timeText: '',
  emptyText: 'No event',
  playersLabel: 'Playing now',
  variant: 'now'
})

// Computed classes based on variant
const containerClasses = computed(() => {
  const baseClasses = 'border-2 rounded-2xl p-6 shadow-xl'
  if (props.variant === 'now') {
    return `${baseClasses} bg-gradient-to-r from-success/20 via-success/10 to-success/20 border-success/30`
  } else {
    return `${baseClasses} bg-gradient-to-r from-info/20 via-info/10 to-info/20 border-info/30`
  }
})

const titleClasses = computed(() => {
  const baseClasses = 'text-2xl font-bold mb-1'
  return props.variant === 'now' 
    ? `${baseClasses} text-success` 
    : `${baseClasses} text-info`
})

const iconClasses = computed(() => {
  const baseClasses = 'w-16 h-16 rounded-xl ring-2 bg-base-100'
  return props.variant === 'now'
    ? `${baseClasses} ring-success`
    : `${baseClasses} ring-info`
})

const fallbackIconClasses = computed(() => {
  const baseClasses = 'w-full h-full rounded-xl bg-gradient-to-br to-primary/20 flex items-center justify-center'
  return props.variant === 'now'
    ? `${baseClasses} from-success/20`
    : `${baseClasses} from-info/20`
})

const gamepadIconClasses = computed(() => {
  const baseClasses = 'fas fa-gamepad text-2xl'
  if (props.variant === 'now') {
    return `${baseClasses} text-success animate-pulse`
  } else {
    return `${baseClasses} text-info`
  }
})

const emptyIconContainerClasses = computed(() => {
  const baseClasses = 'p-3 rounded-xl'
  return props.variant === 'now'
    ? `${baseClasses} bg-success/20`
    : `${baseClasses} bg-info/20`
})

const emptyIconClasses = computed(() => {
  const baseClasses = 'text-2xl opacity-50'
  if (props.variant === 'now') {
    return `${baseClasses} fas fa-calendar-times text-success`
  } else {
    return `${baseClasses} fas fa-calendar-plus text-info`
  }
})


</script>