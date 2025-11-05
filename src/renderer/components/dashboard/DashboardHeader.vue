<template>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <img
        src="@/assets/logo.svg"
        alt="Lan Nexus Logo"
        class="h-12 opacity-80"
      />
    </div>
    
    <div class="flex items-center gap-4">
      <!-- WebSocket Status and Controls -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 text-sm text-base-content/60">
          <div 
            class="w-2 h-2 rounded-full"
            :class="isWebSocketConnected ? 'bg-success animate-pulse' : 'bg-warning'"
          ></div>
          <span>{{ isWebSocketConnected ? 'LIVE' : 'POLLING' }}</span>
          <span class="mx-2">•</span>
          <span>{{ countdown }}s</span>
        </div>
        
        <!-- WebSocket Toggle -->
        <button
          @click="onToggleWebSocket"
          class="btn btn-xs btn-ghost tooltip"
          :data-tip="isWebSocketEnabled ? 'Disable WebSocket' : 'Enable WebSocket'"
        >
          <i :class="isWebSocketEnabled ? 'fas fa-bolt text-success' : 'fas fa-clock text-warning'"></i>
        </button>
        
        <!-- Manual Refresh -->
        <button
          @click="onManualRefresh"
          class="btn btn-xs btn-ghost tooltip"
          data-tip="Manual Refresh"
          :disabled="isRefreshing"
        >
          <i class="fas fa-sync-alt" :class="{ 'animate-spin': isRefreshing }"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  countdown: number
  isWebSocketConnected?: boolean
  isWebSocketEnabled?: boolean
  isRefreshing?: boolean
  onToggleWebSocket?: () => void
  onManualRefresh?: () => void
}

withDefaults(defineProps<Props>(), {
  isWebSocketConnected: false,
  isWebSocketEnabled: true,
  isRefreshing: false,
  onToggleWebSocket: () => {},
  onManualRefresh: () => {}
})
</script>