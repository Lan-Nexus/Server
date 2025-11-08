<template>
  <div class="fixed bottom-4 right-4 space-y-2">
    <!-- Main Connection Status -->
    <div
      class="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300"
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

    <!-- WebSocket Status -->
    <div
      v-if="showWebSocketStatus"
      class="flex items-center gap-2 px-3 py-1 rounded-full shadow-lg transition-all duration-300 text-xs"
      :class="isWebSocketConnected ? 'bg-info text-info-content' : 'bg-warning text-warning-content'"
    >
      <i :class="isWebSocketConnected ? 'fas fa-bolt' : 'fas fa-clock'"></i>
      <span class="font-medium">
        {{ isWebSocketConnected ? 'Real-time' : 'Polling' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  connectionStatus: 'connected' | 'disconnected'
  isWebSocketConnected?: boolean
  showWebSocketStatus?: boolean
}

withDefaults(defineProps<Props>(), {
  isWebSocketConnected: false,
  showWebSocketStatus: true
})
</script>