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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span>Edit</span>
      </div>
    </div>

    <!-- Game Not Found State -->
    <div
      class="flex flex-col items-center justify-center min-h-[50vh] text-center"
      v-if="!game"
    >
      <div class="mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-24 w-24 text-error mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0012 15c-2.837 0-5.374-1.175-7.2-3.062M6.343 6.343A8 8 0 1017.657 17.657 8 8 0 006.343 6.343z"
          />
        </svg>
        <h2 class="text-3xl font-bold text-error mb-2">Game Not Found</h2>
        <p class="text-base-content/60">
          Cannot find the game you're trying to edit.
        </p>
      </div>
      <div class="flex gap-4">
        <button class="btn btn-primary" @click="$router.push({ name: 'home' })">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Go Home
        </button>
        <button class="btn btn-outline" @click="$router.go(-1)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-primary animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
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
