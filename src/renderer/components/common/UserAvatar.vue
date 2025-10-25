<template>
  <div class="avatar-container">
    <div 
      :class="[
        'avatar-wrapper',
        sizeClass,
        { 'avatar-hover': hover }
      ]"
    >
      <!-- User Icon SVG -->
      <div 
        v-if="!showInitials"
        class="avatar-icon"
        :style="{ backgroundColor: backgroundColor }"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="user-icon"
        >
          <path
            d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
            :fill="iconColor"
          />
          <path
            d="M12 14C7.29 14 3.5 17.79 3.5 22.5C3.5 22.78 3.72 23 4 23H20C20.28 23 20.5 22.78 20.5 22.5C20.5 17.79 16.71 14 12 14Z"
            :fill="iconColor"
          />
        </svg>
      </div>
      
      <!-- Initials Fallback -->
      <div 
        v-else
        class="avatar-initials"
        :style="{ 
          backgroundColor: backgroundColor,
          color: iconColor 
        }"
      >
        <span class="initials-text">{{ getInitials() }}</span>
      </div>
      
      <!-- Status Indicator -->
      <div 
        v-if="status"
        :class="[
          'status-indicator',
          `status-${status}`
        ]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showInitials?: boolean
  status?: 'online' | 'offline' | 'away' | 'busy'
  color?: string
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: 'User',
  size: 'md',
  showInitials: false,
  hover: true
})

// Size classes
const sizeClass = computed(() => {
  const sizes = {
    xs: 'size-xs',
    sm: 'size-sm', 
    md: 'size-md',
    lg: 'size-lg',
    xl: 'size-xl'
  }
  return sizes[props.size]
})

// Generate consistent color based on name
const backgroundColor = computed(() => {
  if (props.color) return props.color
  
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'
  ]
  
  const hash = props.name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return colors[Math.abs(hash) % colors.length]
})

const iconColor = computed(() => {
  return 'rgba(255, 255, 255, 0.9)'
})

function getInitials(): string {
  return props.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}
</script>

<style scoped>
.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-wrapper {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.avatar-hover:hover {
  transform: scale(1.05);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  border-color: rgba(255, 255, 255, 0.3);
}

.avatar-icon,
.avatar-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-gradient);
}

.avatar-icon {
  background: v-bind(backgroundColor);
  padding: 20%;
}

.avatar-initials {
  background: v-bind(backgroundColor);
}

.user-icon {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.initials-text {
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.05em;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Size variants */
.size-xs {
  width: 24px;
  height: 24px;
}

.size-xs .initials-text {
  font-size: 10px;
}

.size-xs .status-indicator {
  width: 6px;
  height: 6px;
  border-width: 1px;
}

.size-sm {
  width: 32px;
  height: 32px;
}

.size-sm .initials-text {
  font-size: 12px;
}

.size-sm .status-indicator {
  width: 8px;
  height: 8px;
}

.size-md {
  width: 48px;
  height: 48px;
}

.size-md .initials-text {
  font-size: 16px;
}

.size-md .status-indicator {
  width: 12px;
  height: 12px;
}

.size-lg {
  width: 64px;
  height: 64px;
}

.size-lg .initials-text {
  font-size: 20px;
}

.size-lg .status-indicator {
  width: 16px;
  height: 16px;
}

.size-xl {
  width: 80px;
  height: 80px;
}

.size-xl .initials-text {
  font-size: 24px;
}

.size-xl .status-indicator {
  width: 20px;
  height: 20px;
}

/* Status colors */
.status-online {
  background-color: #10b981;
}

.status-offline {
  background-color: #6b7280;
}

.status-away {
  background-color: #f59e0b;
}

.status-busy {
  background-color: #ef4444;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .avatar-wrapper {
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  }
  
  .avatar-hover:hover {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  }
  
  .status-indicator {
    border-color: #1f2937;
  }
}
</style>