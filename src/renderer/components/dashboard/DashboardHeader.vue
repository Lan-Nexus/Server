<template>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <img
        src="@/assets/logo.svg"
        alt="Lan Nexus Logo"
        class="h-12 opacity-80"
      />
    </div>
    <div class="flex items-center gap-2 text-sm text-base-content/60">
      <div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
      <span>LIVE</span>
      <span class="mx-2">•</span>
      <span>{{ countdown }}s</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  countdown: number
}

defineProps<Props>()
</script>