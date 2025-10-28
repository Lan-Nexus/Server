<template>
  <div class="user-avatar" :class="sizeClass">
    <img
      v-if="avatarUrl"
      :src="avatarUrl"
      :alt="`Avatar for ${name || 'user'}`"
      :class="[
        'rounded-full object-cover transition-transform',
        { 'hover:scale-105': hover }
      ]"
      @error="onImageError"
    />
    <div
      v-else
      :class="[
        'rounded-full bg-gray-300 flex items-center justify-center text-white font-bold',
        sizeClass
      ]"
    >
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { createAvatar } from '@dicebear/core'
import { adventurer } from '@dicebear/collection'

interface AvatarData {
  eyes?: string
  eyebrows?: string
  mouth?: string
  glasses?: string
  earrings?: string
  hair?: string
  hairColor?: string
  skinColor?: string
  backgroundColor?: string
  clothingColor?: string
  eyesColor?: string
  facialHair?: string
  facialHairColor?: string
  accessories?: string
  accessoriesColor?: string
}

interface Props {
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  hover?: boolean
  avatar?: AvatarData | string
  seed?: string
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  size: 'md',
  hover: false,
  seed: ''
})

const imageError = ref(false)

const sizeClass = computed(() => {
  if (typeof props.size === 'number') {
    return ''
  }
  
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl'
  }
  
  return sizeMap[props.size] || sizeMap.md
})

const pixelSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size
  }
  
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80
  }
  
  return sizeMap[props.size] || sizeMap.md
})

const initials = computed(() => {
  if (!props.name) return '??'
  
  return props.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const avatarUrl = computed(() => {
  if (imageError.value) return null
  
  try {
    // If avatar is a string (URL), return it directly
    if (typeof props.avatar === 'string') {
      return props.avatar
    }
    
    // If avatar is an object, use it to configure the adventurer avatar
    if (props.avatar && typeof props.avatar === 'object') {
      const avatarConfig: any = {
        seed: props.seed || props.name || 'default',
        size: pixelSize.value
      }
      
      // Map avatar properties to adventurer options
      if (props.avatar.eyes) avatarConfig.eyes = [props.avatar.eyes]
      if (props.avatar.eyebrows) avatarConfig.eyebrows = [props.avatar.eyebrows]
      if (props.avatar.mouth) avatarConfig.mouth = [props.avatar.mouth]
      if (props.avatar.hair) avatarConfig.hair = [props.avatar.hair]
      if (props.avatar.hairColor) avatarConfig.hairColor = [props.avatar.hairColor]
      if (props.avatar.skinColor) avatarConfig.skinColor = [props.avatar.skinColor]
      if (props.avatar.backgroundColor) avatarConfig.backgroundColor = [props.avatar.backgroundColor]
      if (props.avatar.clothingColor) avatarConfig.clothingColor = [props.avatar.clothingColor]
      if (props.avatar.eyesColor) avatarConfig.eyesColor = [props.avatar.eyesColor]
      if (props.avatar.facialHair) avatarConfig.facialHair = [props.avatar.facialHair]
      if (props.avatar.facialHairColor) avatarConfig.facialHairColor = [props.avatar.facialHairColor]
      if (props.avatar.accessories) avatarConfig.accessories = [props.avatar.accessories]
      if (props.avatar.accessoriesColor) avatarConfig.accessoriesColor = [props.avatar.accessoriesColor]
      
      // Handle glasses and earrings as accessories
      if (props.avatar.glasses) {
        avatarConfig.accessories = avatarConfig.accessories || []
        avatarConfig.accessories.push(props.avatar.glasses)
      }
      if (props.avatar.earrings) {
        avatarConfig.accessories = avatarConfig.accessories || []
        avatarConfig.accessories.push(props.avatar.earrings)
      }
      
      const avatar = createAvatar(adventurer, avatarConfig)
      return avatar.toDataUri()
    }
    
    // Fallback: generate avatar from name/seed
    if (props.name || props.seed) {
      const avatar = createAvatar(adventurer, {
        seed: props.seed || props.name || 'default',
        size: pixelSize.value
      })
      return avatar.toDataUri()
    }
    
    return null
  } catch (error) {
    console.error('Error generating avatar:', error)
    return null
  }
})

const onImageError = () => {
  imageError.value = true
}
</script>

<style scoped>
.user-avatar img,
.user-avatar > div {
  width: 100%;
  height: 100%;
}

.user-avatar[style*="width"] img,
.user-avatar[style*="width"] > div {
  width: var(--size);
  height: var(--size);
}
</style>