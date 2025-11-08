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
      needsKey: "0", // Shortcuts don't need keys
      icon: game.icon,
      headerImage: game.headerImage,
      logo: game.logo,
      imageCard: game.imageCard,
      heroImage: game.heroImage,
      install: "", // No install script for shortcuts
      uninstall: "", // No uninstall script for shortcuts
      play: "await runDirect(GAME_EXECUTABLE);", // Use runDirect for shortcuts to bypass game directory
      type: "shortcut",
      status: game.status,
      keys: [],
    })
    .then(() => {
      router.push({ name: "home" });
    })
    .catch((error) => {
      console.error("Error creating shortcut game:", error);
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
            Create Shortcut Game
          </h1>
          <p class="text-base-content/70 mt-2">
            Add a quick launch shortcut for an already-installed game
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
          <div class="p-3 bg-success/10 rounded-xl">
            <i class="fas fa-external-link-alt text-success text-xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold">Shortcut Configuration</h3>
            <p class="text-base-content/60 text-sm">
              Just provide the executable path and basic info - no installation
              required
            </p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-6" v-if="gamesStore.isProcessing">
          <div class="flex items-center gap-3 mb-2">
            <i class="fas fa-sync-alt text-primary animate-spin"></i>
            <span class="text-sm font-medium">Creating shortcut...</span>
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
          primary="Create Shortcut"
          :isProgressing="gamesStore.isProcessing"
          :progressLevel="gamesStore.uploadProgress"
          type="shortcut"
        />
      </div>
    </div>
  </div>
</template>
