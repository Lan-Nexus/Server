<template>
  <router-link :to="to" :class="cardClasses">
    <div class="card-body text-center">
      <div :class="iconClasses">
        <i :class="icon"></i>
      </div>
      <h2 class="card-title justify-center text-2xl mb-2">{{ title }}</h2>
      <p class="text-base-content/70 mb-4">{{ description }}</p>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  description: string
  icon: string
  to: string
  variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info' | 'error'
}

const props = defineProps<Props>()

const cardClasses = computed(() => {
  return 'card bg-base-100 border border-base-300/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1'
})

const iconClasses = computed(() => {
  const baseClasses = 'text-4xl mb-4'
  const variantClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
    error: 'text-error'
  }
  return `${baseClasses} ${variantClasses[props.variant]}`
})
</script>