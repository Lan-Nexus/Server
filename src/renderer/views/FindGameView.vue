<script setup>
import { ref, watch } from "vue";
import api from "../utls/api";
import AddGameItem from "@/components/games/AddGameItem.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const searchQuery = ref("");
const games = ref([]);

let debounceTimeout = null;

watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(async () => {
    const response = await api.post("/api/games/search", { query: newQuery });
    console.log("Search results:", response.data);
    games.value = response.data.results || [];
  }, 300); // 300ms debounce
});

function handle(game) {
  router.push(`/game/find/add/${game.id}`);
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
            Find Games
          </h1>
          <p class="text-base-content/70 mt-2">
            {{
              games.length > 0
                ? `${games.length} games found`
                : "Search for games to add to your library"
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl mb-8"
    >
      <div class="card-body">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-primary/10 rounded-lg">
            <i class="fas fa-search text-primary text-xl"></i>
          </div>
          <h2 class="text-xl font-semibold">Search Games</h2>
        </div>

        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <i class="fas fa-search text-base-content/40"></i>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for games (e.g. 'Counter-Strike', 'Minecraft')..."
            class="input input-bordered w-full pl-10 bg-base-100/80 focus:bg-base-100 transition-all duration-200 text-lg py-3"
          />
          <div
            v-if="searchQuery"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <button
              @click="
                searchQuery = '';
                games = [];
              "
              class="btn btn-ghost btn-sm btn-circle hover:btn-error transition-all duration-200"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="text-sm text-base-content/60 mt-2">
          <i class="fas fa-info-circle mr-1"></i>
          Search results will appear as you type
        </div>
      </div>
    </div>

    <!-- Games Grid -->
    <div
      v-if="games.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <template v-for="game in games" :key="game.id">
        <AddGameItem
          :gameId="game.id"
          :name="game.name"
          :image="game.image"
          :hasGame="game.hasGame"
          :isProcessing="false"
          @handleAddGame="handle(game)"
        />
      </template>
    </div>

    <!-- Empty States -->
    <div
      v-else-if="searchQuery && games.length === 0"
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
    >
      <div
        class="card-body flex flex-col items-center justify-center py-16 text-center"
      >
        <i class="fas fa-search text-8xl text-base-content/30 mb-4"></i>
        <h3 class="text-2xl font-bold mb-2">No Games Found</h3>
        <p class="text-base-content/60 mb-4">
          No games found for "{{ searchQuery }}". Try different keywords or
          check your spelling.
        </p>
        <button @click="searchQuery = ''" class="btn btn-primary">
          Clear Search
        </button>
      </div>
    </div>

    <div
      v-else
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
    >
      <div
        class="card-body flex flex-col items-center justify-center py-16 text-center"
      >
        <i class="fas fa-lightbulb text-8xl text-base-content/30 mb-4"></i>
        <h3 class="text-2xl font-bold mb-2">Ready to Search</h3>
        <p class="text-base-content/60">
          Start typing in the search box above to find games to add to your
          library.
        </p>
      </div>
    </div>
  </div>
</template>
