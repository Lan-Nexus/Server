<script setup lang="ts">
import GameForm from "@/components/gameForm/GameForm.vue";
import { useGamesStore, type postGameType } from "@/stores/games";
import { useRoute } from "vue-router";
import { ref, type Ref } from "vue";
import router from "@/router";

const route = useRoute();
const gamesStore = useGamesStore();

const id = ref(route.params.id) as Ref<string>;
const game = gamesStore.getGameById(Number(id.value));

function updateHandler(game: postGameType) {
  gamesStore
    .updateGame(id.value, {
      gameID: game.gameID,
      name: game.name,
      executable: game.executable,
      description: game.description,
      needsKey: game.needsKey,
      icon: game.icon,
      headerImage: game.headerImage,
      logo: game.logo,
      imageCard: game.imageCard,
      heroImage: game.heroImage,
      install: game.install,
      uninstall: game.uninstall,
      play: game.play,
      type: game.type,
      status: game.status,
      archives: game.archives,
      keys: [],
    })
    .then(() => {
      router.push({ name: "home" });
    })
    .catch((error) => {
      console.error("Error creating game:", error);
    });
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-6">
        <button
          @click="$router.go(-1)"
          class="btn btn-circle btn-ghost hover:btn-primary transition-all duration-200"
        >
          <i class="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1
            class="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            Update Game
          </h1>
          <p class="text-base-content/70 mt-2" v-if="game">
            Editing: {{ game.name }}
          </p>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div
        class="flex items-center gap-3 text-sm text-base-content/60"
        v-if="game"
      >
        <div class="flex items-center gap-2">
          <div class="avatar avatar-xs">
            <div class="w-6 h-6 rounded">
              <img :src="game.icon" :alt="`${game.name} icon`" />
            </div>
          </div>
          <span>{{ game.name }}</span>
        </div>
        <i class="fas fa-chevron-right text-base-content/60"></i>
        <span>Edit</span>
      </div>
    </div>

    <!-- Game Not Found State -->
    <div
      class="flex flex-col items-center justify-center min-h-[50vh] text-center"
      v-if="!game"
    >
      <div class="mb-8">
        <i
          class="fas fa-exclamation-triangle text-8xl text-error mx-auto mb-4"
        ></i>
        <h2 class="text-3xl font-bold text-error mb-2">Game Not Found</h2>
        <p class="text-base-content/60">
          Cannot find the game you're trying to edit.
        </p>
      </div>
      <div class="flex gap-4">
        <button class="btn btn-primary" @click="$router.push({ name: 'home' })">
          <i class="fas fa-home mr-2"></i>
          Go Home
        </button>
        <button class="btn btn-outline" @click="$router.go(-1)">
          <i class="fas fa-arrow-left mr-2"></i>
          Go Back
        </button>
      </div>
    </div>

    <!-- Game Form -->
    <div
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
      v-else
    >
      <div class="card-body">
        <!-- Form Header -->
        <div
          class="flex items-center gap-3 mb-6 pb-4 border-b border-base-300/20"
        >
          <div class="p-3 bg-primary/10 rounded-xl">
            <i class="fas fa-edit text-primary"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold">Game Configuration</h3>
            <p class="text-base-content/60 text-sm">
              Update your game settings and information
            </p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-6" v-if="gamesStore.isProcessing">
          <div class="flex items-center gap-3 mb-2">
            <i class="fas fa-sync-alt text-primary animate-spin"></i>
            <span class="text-sm font-medium">Updating game...</span>
            <span
              class="text-xs text-base-content/60"
              v-if="gamesStore.uploadProgress"
            >
              {{ Math.round(gamesStore.uploadProgress) }}%
            </span>
          </div>
          <progress
            class="progress progress-primary w-full"
            :value="gamesStore.uploadProgress || 0"
            max="100"
          ></progress>
        </div>

        <!-- Game Form Component -->
        <GameForm
          @primary="updateHandler"
          primary="Update Game"
          :game="game"
          :isProgressing="gamesStore.isProcessing"
          :progressLevel="gamesStore.uploadProgress"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Glass morphism effect */
.card {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Smooth animations */
.btn {
  transition: all 0.2s ease-in-out;
}

/* Loading spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Progress bar styling */
.progress {
  transition: all 0.3s ease-in-out;
}
</style>
