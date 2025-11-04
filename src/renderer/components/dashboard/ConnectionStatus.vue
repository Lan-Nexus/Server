<template>
  <div class="fixed bottom-4 right-4">
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
  </div>
</template>

<script setup lang="ts">
interface Props {
  connectionStatus: 'connected' | 'disconnected'
}

defineProps<Props>()
</script>