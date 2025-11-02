<template>
  <div class="user-avatar-container">
    <div class="user-avatar" :class="sizeClass">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="`Avatar for ${name || 'user'}`"
        :class="[
          'rounded-full object-cover transition-transform',
          { 'hover:scale-105': hover },
        ]"
        @error="onImageError"
      />
      <div
        v-else
        :class="[
          'rounded-full bg-gray-300 flex items-center justify-center text-white font-bold',
          sizeClass,
        ]"
      >
        {{ initials }}
      </div>
    </div>

    <!-- Avatar Controls -->
    <div v-if="showControls" class="avatar-controls">
      <div class="control-group">
        <label>Eyes:</label>
        <select v-model="localAvatar.eyes" @change="updateAvatar">
          <option value="normal">Normal</option>
          <option value="wink">Wink</option>
          <option value="happy">Happy</option>
          <option value="sleepy">Sleepy</option>
          <option value="surprised">Surprised</option>
        </select>
      </div>

      <div class="control-group">
        <label>Eyebrows:</label>
        <select v-model="localAvatar.eyebrows" @change="updateAvatar">
          <option value="normal">Normal</option>
          <option value="raised">Raised</option>
          <option value="serious">Serious</option>
          <option value="angry">Angry</option>
        </select>
      </div>

      <div class="control-group">
        <label>Mouth:</label>
        <select v-model="localAvatar.mouth" @change="updateAvatar">
          <option value="smile">Smile</option>
          <option value="serious">Serious</option>
          <option value="open">Open</option>
          <option value="grin">Grin</option>
          <option value="sad">Sad</option>
        </select>
      </div>

      <div class="control-group">
        <label>Hair:</label>
        <select v-model="localAvatar.hair" @change="updateAvatar">
          <option value="short">Short</option>
          <option value="long">Long</option>
          <option value="curly">Curly</option>
          <option value="pixie">Pixie</option>
          <option value="bald">Bald</option>
        </select>
      </div>

      <div class="control-group">
        <label>Hair Color:</label>
        <input
          type="color"
          v-model="localAvatar.hairColor"
          @change="updateAvatar"
        />
      </div>

      <div class="control-group">
        <label>Skin Color:</label>
        <input
          type="color"
          v-model="localAvatar.skinColor"
          @change="updateAvatar"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";

interface AvatarData {
  eyes?: string;
  eyebrows?: string;
  mouth?: string;
  glasses?: string;
  earrings?: string;
  hair?: string;
  hairColor?: string;
  skinColor?: string;
  backgroundColor?: string;
  clothingColor?: string;
  eyesColor?: string;
  facialHair?: string;
  facialHairColor?: string;
  accessories?: string;
  accessoriesColor?: string;
}

interface Props {
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  hover?: boolean;
  avatar?: AvatarData | string;
  seed?: string;
  showControls?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  name: "",
  size: "md",
  hover: false,
  seed: "",
  showControls: false,
});

const emit = defineEmits<{
  "avatar-updated": [avatar: AvatarData];
}>();

const imageError = ref(false);

// Local avatar state for editing
const localAvatar = ref<AvatarData>({
  eyes: "normal",
  eyebrows: "normal",
  mouth: "smile",
  hair: "short",
  hairColor: "#8B4513",
  skinColor: "#FDBCB4",
  ...((typeof props.avatar === "object" && props.avatar) || {}),
});

// Watch for changes in avatar prop
watch(
  () => props.avatar,
  (newAvatar) => {
    if (typeof newAvatar === "object" && newAvatar) {
      localAvatar.value = { ...localAvatar.value, ...newAvatar };
    }
  },
  { deep: true, immediate: true }
);

const updateAvatar = () => {
  emit("avatar-updated", { ...localAvatar.value });
};

const sizeClass = computed(() => {
  if (typeof props.size === "number") {
    return "";
  }

  const sizeMap = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
    xl: "w-20 h-20 text-xl",
  };

  return sizeMap[props.size] || sizeMap.md;
});

const pixelSize = computed(() => {
  if (typeof props.size === "number") {
    return props.size;
  }

  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  };

  return sizeMap[props.size] || sizeMap.md;
});

const initials = computed(() => {
  if (!props.name) return "??";

  return props.name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();
});

const avatarUrl = computed(() => {
  if (imageError.value) return null;

  try {
    // Use local avatar data when controls are shown, otherwise use props
    const avatarData = props.showControls ? localAvatar.value : props.avatar;

    // If avatar is a string (URL), return it directly
    if (typeof avatarData === "string") {
      return avatarData;
    }

    // If avatar is an object, use it to configure the adventurer avatar
    if (avatarData && typeof avatarData === "object") {
      const avatarConfig: any = {
        seed: props.seed || props.name || "default",
        size: pixelSize.value,
      };

      // Map avatar properties to adventurer options
      if (avatarData.eyes) avatarConfig.eyes = [avatarData.eyes];
      if (avatarData.eyebrows) avatarConfig.eyebrows = [avatarData.eyebrows];
      if (avatarData.mouth) avatarConfig.mouth = [avatarData.mouth];
      if (avatarData.hair) avatarConfig.hair = [avatarData.hair];
      if (avatarData.hairColor) avatarConfig.hairColor = [avatarData.hairColor];
      if (avatarData.skinColor) avatarConfig.skinColor = [avatarData.skinColor];
      if (avatarData.backgroundColor)
        avatarConfig.backgroundColor = [avatarData.backgroundColor];
      if (avatarData.clothingColor)
        avatarConfig.clothingColor = [avatarData.clothingColor];
      if (avatarData.eyesColor) avatarConfig.eyesColor = [avatarData.eyesColor];
      if (avatarData.facialHair)
        avatarConfig.facialHair = [avatarData.facialHair];
      if (avatarData.facialHairColor)
        avatarConfig.facialHairColor = [avatarData.facialHairColor];
      if (avatarData.accessories)
        avatarConfig.accessories = [avatarData.accessories];
      if (avatarData.accessoriesColor)
        avatarConfig.accessoriesColor = [avatarData.accessoriesColor];

      // Handle glasses and earrings as accessories
      if (avatarData.glasses) {
        avatarConfig.accessories = avatarConfig.accessories || [];
        avatarConfig.accessories.push(avatarData.glasses);
      }
      if (avatarData.earrings) {
        avatarConfig.accessories = avatarConfig.accessories || [];
        avatarConfig.accessories.push(avatarData.earrings);
      }

      const avatar = createAvatar(adventurer, avatarConfig);
      return avatar.toDataUri();
    }

    // Fallback: generate avatar from name/seed
    if (props.name || props.seed) {
      const avatar = createAvatar(adventurer, {
        seed: props.seed || props.name || "default",
        size: pixelSize.value,
      });
      return avatar.toDataUri();
    }

    return null;
  } catch (error) {
    console.error("Error generating avatar:", error);
    return null;
  }
});

const onImageError = () => {
  imageError.value = true;
};
</script>

<style scoped>
.user-avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

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

.avatar-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 400px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.control-group select,
.control-group input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.control-group select:focus,
.control-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.control-group input[type="color"] {
  width: 50px;
  height: 36px;
  padding: 2px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
