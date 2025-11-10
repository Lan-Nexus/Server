<script setup lang="ts">
import GameForm from "@/components/gameForm/GameForm.vue";
import router from "@/router";
import { useGamesStore, type postGameType } from "@/stores/games";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const gamesStore = useGamesStore();
const gameType = ref<string>("");
const showForm = ref(false);

// Check if type was passed via route params
onMounted(() => {
  if (route.params.type && typeof route.params.type === "string") {
    gameType.value = route.params.type;
    showForm.value = true;
  }
});

function selectGameType(type: string) {
  gameType.value = type;
  showForm.value = true;
}

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
      install: game.install,
      uninstall: game.uninstall,
      play: game.play,
      type: game.type,
      status: game.status,
      archives: game.archives,
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
        <!-- Game Type Selection (if not yet selected) -->
        <div v-if="!showForm">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-info/10 rounded-lg">
              <i class="fas fa-gamepad text-info text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-semibold">Select Game Type</h2>
              <p class="text-base-content/60 text-sm">
                Choose how you want to add this game
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Archive Type -->
            <button
              @click="selectGameType('archive')"
              class="card bg-base-200 hover:bg-success/20 hover:border-success border-2 border-transparent transition-all duration-200 cursor-pointer"
            >
              <div class="card-body items-center text-center p-6">
                <div class="p-4 bg-success/10 rounded-full mb-3">
                  <i class="fas fa-download text-success text-3xl"></i>
                </div>
                <h3 class="card-title text-lg">Downloadable Game</h3>
                <p class="text-sm text-base-content/60">
                  Game with installation and setup
                </p>
                <div class="badge badge-success mt-2">Full Features</div>
              </div>
            </button>

            <!-- Shortcut Type -->
            <button
              @click="selectGameType('shortcut')"
              class="card bg-base-200 hover:bg-warning/20 hover:border-warning border-2 border-transparent transition-all duration-200 cursor-pointer"
            >
              <div class="card-body items-center text-center p-6">
                <div class="p-4 bg-warning/10 rounded-full mb-3">
                  <i class="fas fa-external-link-alt text-warning text-3xl"></i>
                </div>
                <h3 class="card-title text-lg">Shortcut</h3>
                <p class="text-sm text-base-content/60">
                  Quick launch for installed games
                </p>
                <div class="badge badge-warning mt-2">Launch Only</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Form (shown after type selection) -->
        <div v-else>
          <!-- Form Header -->

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
            :type="gameType"
          />
        </div>
      </div>
    </div>
  </div>
</template>
