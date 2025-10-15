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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 class="text-xl font-semibold">Search Games</h2>
        </div>

        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-base-content/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="text-sm text-base-content/60 mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 inline mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-24 w-24 text-base-content/30 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-24 w-24 text-base-content/30 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h3 class="text-2xl font-bold mb-2">Ready to Search</h3>
        <p class="text-base-content/60">
          Start typing in the search box above to find games to add to your
          library.
        </p>
      </div>
    </div>
  </div>
</template>
