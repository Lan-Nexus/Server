<script setup lang="ts">
import { useSteamGamesStore } from "@/stores/steamGames";
import { ref } from "vue";
import { useNotificationStore } from "@/stores/notification";
import AddGameItem from "@/components/games/AddGameItem.vue";

const steamGamesStore = useSteamGamesStore();
steamGamesStore.getSteamGames();
const isProcessing = ref(false);

async function handleAddGame(game: any) {
  try {
    isProcessing.value = true;
    await steamGamesStore.addGame(game);
  } catch (error) {
    const notificationStore = useNotificationStore();
    notificationStore.addNotification(
      "error",
      "Failed to add game. Please try again later"
    );
  } finally {
    isProcessing.value = false;
  }
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
            Steam Games
          </h1>
          <p class="text-base-content/70 mt-2">
            {{ steamGamesStore.steamGames.length }} Steam games available to add
          </p>
        </div>
      </div>

      <!-- Steam Info Card -->
      <div
        class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl mb-6"
      >
        <div class="card-body">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-accent/10 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold">Import from Steam</h3>
              <p class="text-base-content/60 text-sm">
                Add games from your Steam library with automatic artwork and
                metadata
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="steamGamesStore.steamGames.length === 0"
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
    >
      <div class="card-body flex flex-col items-center justify-center py-16">
        <span
          class="loading loading-spinner loading-lg text-primary mb-4"
        ></span>
        <h3 class="text-xl font-semibold mb-2">Loading Steam Games</h3>
        <p class="text-base-content/60">
          Please wait while we fetch your Steam library...
        </p>
      </div>
    </div>

    <!-- Games Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <template v-for="game in steamGamesStore.steamGames" :key="game.appid">
        <AddGameItem
          :gameId="game.appid"
          :name="game.name"
          :image="`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`"
          :hasGame="steamGamesStore.hasGame(game.appid.toString())"
          :isProcessing="isProcessing"
          @handleAddGame="handleAddGame(game)"
        />
      </template>
    </div>
  </div>
</template>
