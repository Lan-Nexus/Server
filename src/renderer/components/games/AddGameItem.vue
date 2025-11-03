<script setup lang="ts">
const props = defineProps<{
  gameId: number;
  name: string;
  image?: string;
  hasGame?: boolean;
  isProcessing?: boolean;
}>();

const emit = defineEmits<{
  (e: "handleAddGame"): void;
}>();
</script>

<template>
  <div
    class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
  >
    <!-- Game Image -->
    <figure class="relative overflow-hidden">
      <div
        class="bg-gradient-to-br from-base-200 to-base-300 h-40 w-full flex items-center justify-center"
      >
        <img
          v-if="props.image"
          loading="lazy"
          :src="props.image"
          :alt="`${props.name} header`"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          @error="(event) => { if (event && event.target) { (event.target as HTMLElement).style.display = 'none'; } }"
        />
        <div v-else class="text-6xl text-base-content/30">🎮</div>
      </div>

      <!-- Overlay for better text readability -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>

      <!-- Status Badge -->
      <div class="absolute top-3 right-3">
        <div v-if="props.hasGame" class="badge badge-success gap-1 shadow-lg">
          <i class="fas fa-check text-xs"></i>
          Added
        </div>
        <div
          v-else-if="isProcessing"
          class="badge badge-warning gap-1 shadow-lg"
        >
          <span class="loading loading-spinner loading-xs"></span>
          Adding...
        </div>
      </div>
    </figure>

    <!-- Card Content -->
    <div class="card-body p-4">
      <!-- Game Title -->
      <div class="mb-4">
        <h3
          class="card-title text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200"
        >
          {{ props.name }}
        </h3>
        <div class="flex items-center gap-2 mt-2">
          <div class="badge badge-primary badge-sm">ID: {{ props.gameId }}</div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="card-actions justify-center mt-auto">
        <button
          v-if="isProcessing"
          disabled
          class="btn btn-primary btn-block gap-2"
        >
          <span class="loading loading-spinner loading-sm"></span>
          Adding Game...
        </button>
        <button
          v-else-if="props.hasGame"
          disabled
          class="btn btn-success btn-block gap-2"
        >
          <i class="fas fa-check"></i>
          Already Added
        </button>
        <button
          v-else
          @click="emit('handleAddGame')"
          class="btn btn-primary btn-block gap-2 hover:btn-accent transition-all duration-200"
        >
          <i class="fas fa-plus"></i>
          Add Game
        </button>
      </div>
    </div>
  </div>
</template>
