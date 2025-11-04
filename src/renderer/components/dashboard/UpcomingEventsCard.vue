<template>
  <div class="bg-base-100/90 backdrop-blur-sm border border-base-300/30 rounded-2xl shadow-xl flex flex-col">
    <div class="p-4 border-b border-base-300/30">
      <h2 class="text-xl font-bold flex items-center gap-2">
        <i class="fas fa-calendar text-info"></i>
        Upcoming Events
      </h2>
    </div>

    <div class="p-4 flex-1 overflow-y-auto">
      <div v-if="isLoading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-md text-primary"></span>
      </div>

      <div v-else-if="events.length === 0" class="text-center py-8 text-base-content/60">
        <i class="fas fa-calendar-plus text-4xl mb-3 opacity-30"></i>
        <p class="text-lg">No upcoming events</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="event in events.slice(0, maxEvents)"
          :key="event.id"
          class="flex items-center gap-3 p-3 bg-info/5 border border-info/20 rounded-lg hover:bg-info/10 transition-all duration-300"
        >
          <div class="avatar">
            <div class="w-8 h-8 rounded-lg ring-1 ring-info/20 bg-base-200">
              <img
                v-if="event.gameIcon"
                :src="event.gameIcon"
                :alt="`${event.gameName} icon`"
                class="w-full h-full rounded-lg object-cover"
                @error="(e) => (e.target as HTMLImageElement).style.display='none'"
              />
              <div
                v-else
                class="w-full h-full rounded-lg bg-gradient-to-br from-info/20 to-secondary/20 flex items-center justify-center"
              >
                <i class="fas fa-calendar text-info text-xs"></i>
              </div>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{{ event.gameName }}</div>
            <div class="text-xs text-base-content/70 truncate">
              {{ formatEventTime(typeof event.startTime === 'string' ? event.startTime : event.startTime.toISOString()) }}
            </div>
            <div v-if="event.description" class="text-xs text-base-content/60 truncate">
              {{ event.description }}
            </div>
          </div>
          <div class="text-xs text-info font-medium">
            {{ formatRelativeTime(typeof event.startTime === 'string' ? event.startTime : event.startTime.toISOString()) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameEvent } from '@/stores/events'

interface Props {
  events: GameEvent[]
  isLoading: boolean
  maxEvents?: number
  formatEventTime: (dateString: string) => string
  formatRelativeTime: (dateString: string) => string
}

withDefaults(defineProps<Props>(), {
  maxEvents: 5
})
</script>