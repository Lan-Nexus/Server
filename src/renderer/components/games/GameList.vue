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
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-primary gap-2">
              <i class="fas fa-plus"></i>
              Add Game
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu bg-base-100/95 backdrop-blur-sm border border-base-300/20 rounded-xl shadow-2xl w-56 p-2 mt-2 gap-1"
            >
              <li>
                <router-link
                  :to="{ name: 'addGameWithImages' }"
                  class="flex items-center gap-3 p-3 hover:bg-info/10 hover:text-info rounded-lg transition-all duration-200"
                >
                  <div class="p-1 bg-info/10 rounded-lg">
                    <i class="fas fa-search text-info"></i>
                  </div>
                  <div>
                    <div class="font-semibold">Add With Images</div>
                    <div class="text-xs opacity-60">Search and pick images</div>
                  </div>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'createGameSteam' }"
                  class="flex items-center gap-3 p-3 hover:bg-accent/10 hover:text-accent rounded-lg transition-all duration-200"
                >
                  <div class="p-1 bg-accent/10 rounded-lg">
                    <i class="fab fa-steam text-accent"></i>
                  </div>
                  <div>
                    <div class="font-semibold">Add From Steam</div>
                    <div class="text-xs opacity-60">Import from Steam</div>
                  </div>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'createGame' }"
                  class="flex items-center gap-3 p-3 hover:bg-success/10 hover:text-success rounded-lg transition-all duration-200"
                >
                  <div class="p-1 bg-success/10 rounded-lg">
                    <i class="fas fa-plus text-success"></i>
                  </div>
                  <div>
                    <div class="font-semibold">Create New</div>
                    <div class="text-xs opacity-60">Manual entry</div>
                  </div>
                </router-link>
              </li>
            </ul>
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
                    <i class="fas fa-image text-primary"></i>
                    Icon
                  </div>
                </th>
                <th class="bg-transparent">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-gamepad text-secondary"></i>
                    Game Name
                  </div>
                </th>
                <th class="bg-transparent">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-tag text-info"></i>
                    Type
                  </div>
                </th>
                <th class="bg-transparent">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-images text-accent"></i>
                    Header Image
                  </div>
                </th>
                <th class="bg-transparent text-right">
                  <div class="flex items-center justify-end gap-2">
                    <i class="fas fa-cogs text-warning"></i>
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
                <td colspan="5" class="text-center py-12">
                  <div
                    class="flex flex-col items-center gap-4 text-base-content/50"
                  >
                    <i class="fas fa-gamepad text-6xl"></i>
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
