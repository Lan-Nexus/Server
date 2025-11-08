<template>
  <div :class="cardClasses">
    <div class="flex items-center justify-center mb-4">
      <div :class="iconContainerClasses">
        <i :class="iconClasses"></i>
      </div>
    </div>
    <div :class="valueClasses">{{ value }}</div>
    <div class="text-base-content/70 font-medium">{{ title }}</div>
    <div class="text-xs text-base-content/50 mt-1">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  description: string
  icon: string
  variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info' | 'error'
}

const props = defineProps<Props>()

const cardClasses = computed(() => {
  const baseClasses = 'border-2 rounded-2xl p-6 shadow-xl text-center'
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-primary/30',
    secondary: 'bg-gradient-to-r from-secondary/20 via-secondary/10 to-secondary/20 border-secondary/30',
    accent: 'bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 border-accent/30',
    success: 'bg-gradient-to-r from-success/20 via-success/10 to-success/20 border-success/30',
    warning: 'bg-gradient-to-r from-warning/20 via-warning/10 to-warning/20 border-warning/30',
    info: 'bg-gradient-to-r from-info/20 via-info/10 to-info/20 border-info/30',
    error: 'bg-gradient-to-r from-error/20 via-error/10 to-error/20 border-error/30'
  }
  return `${baseClasses} ${variantClasses[props.variant]}`
})

const iconContainerClasses = computed(() => {
  const variantClasses = {
    primary: 'p-3 bg-primary/10 rounded-full',
    secondary: 'p-3 bg-secondary/10 rounded-full',
    accent: 'p-3 bg-accent/10 rounded-full',
    success: 'p-3 bg-success/10 rounded-full',
    warning: 'p-3 bg-warning/10 rounded-full',
    info: 'p-3 bg-info/10 rounded-full',
    error: 'p-3 bg-error/10 rounded-full'
  }
  return variantClasses[props.variant]
})

const iconClasses = computed(() => {
  const baseClasses = `${props.icon} text-2xl`
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

const valueClasses = computed(() => {
  const baseClasses = 'text-3xl font-bold mb-2'
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