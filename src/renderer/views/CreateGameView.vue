<script setup lang="ts">
import GameForm from "@/components/gameForm/GameForm.vue";
import router from "@/router";
import { useGamesStore, type postGameType } from "@/stores/games";

const gamesStore = useGamesStore();

function createGame(game: postGameType) {
  gamesStore
    .createGame({
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
      install: game.install, // Placeholder for install script
      uninstall: game.uninstall, // Placeholder for uninstall script
      play: game.play,
      type: game.type,
      status: game.status,
      keys: game.keys,
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
            Create New Game
          </h1>
          <p class="text-base-content/70 mt-2">
            Add a custom game to your library
          </p>
        </div>
      </div>
    </div>

    <!-- Form Container -->
    <div
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
    >
      <div class="card-body">
        <!-- Form Header -->
        <div
          class="flex items-center gap-3 mb-6 pb-4 border-b border-base-300/20"
        >
          <div class="p-3 bg-primary/10 rounded-xl">
            <i class="fas fa-plus text-primary text-xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold">Game Configuration</h3>
            <p class="text-base-content/60 text-sm">
              Configure your custom game settings and information
            </p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-6" v-if="gamesStore.isProcessing">
          <div class="flex items-center gap-3 mb-2">
            <i class="fas fa-sync-alt text-primary animate-spin"></i>
            <span class="text-sm font-medium">Creating game...</span>
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
          @primary="createGame"
          primary="Create Game"
          :isProgressing="gamesStore.isProcessing"
          :progressLevel="gamesStore.uploadProgress"
        />
      </div>
    </div>
  </div>
</template>
