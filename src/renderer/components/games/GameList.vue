<script lang="ts" setup>
import GameItem from "@/components/games/GameItem.vue";
import { useGamesStore } from "@/stores/games";
import { computed } from "vue";

const gamesStore = useGamesStore();
gamesStore.getGames();

const gameCount = computed(() => gamesStore.games.length);
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1
            class="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            Game Library
          </h1>
          <p class="text-base-content/70 mt-2">
            {{ gameCount }} {{ gameCount === 1 ? "game" : "games" }} in your
            collection
          </p>
        </div>
        <div class="flex gap-2">
          <div class="badge badge-primary badge-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Gaming
          </div>
        </div>
      </div>
    </div>

    <!-- Games Grid/List Container -->
    <div
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
    >
      <div class="card-body p-0">
        <!-- Enhanced Table -->
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead class="bg-base-200/50">
              <tr class="border-b border-base-300/30">
                <th class="bg-transparent">
                  <div class="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Icon
                  </div>
                </th>
                <th class="bg-transparent">
                  <div class="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-secondary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"
                      />
                    </svg>
                    Game Name
                  </div>
                </th>
                <th class="bg-transparent">
                  <div class="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Header Image
                  </div>
                </th>
                <th class="bg-transparent text-right">
                  <div class="flex items-center justify-end gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-warning"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="game in gamesStore.games" :key="game.id">
                <GameItem :game="game" />
              </template>

              <!-- Empty State -->
              <tr v-if="gameCount === 0">
                <td colspan="4" class="text-center py-12">
                  <div
                    class="flex flex-col items-center gap-4 text-base-content/50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-16 w-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9h6"
                      />
                    </svg>
                    <div>
                      <h3 class="text-lg font-semibold">No games found</h3>
                      <p class="text-sm">
                        Start building your game collection!
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom hover effects */
.table tbody tr:hover {
  background-color: rgba(var(--color-base-200), 0.3);
  transition: all 0.2s ease-in-out;
}

/* Smooth animations */
.table {
  transition: all 0.3s ease;
}

/* Glass morphism effect for the card */
.card {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>
