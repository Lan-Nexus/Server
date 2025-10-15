<script setup lang="ts">
import { useGamesStore } from "@/stores/games";
import ActionButtons from "@/components/games/ActionButtons.vue";
import GameKeys from "@/components/games/GameKeys.vue";
import { useRoute } from "vue-router";
import { ref, type Ref, onMounted, watch } from "vue";
import api from "@/utls/api";

const route = useRoute();
const gamesStore = useGamesStore();

const id = ref(route.params.id) as Ref<string>;
let game = gamesStore.getGameById(Number(id.value));

const keys = ref([]);
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
    <!-- Game Not Found State -->
    <template v-if="!game">
      <div
        class="flex flex-col items-center justify-center min-h-[60vh] text-center"
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
          <h1 class="text-4xl font-bold text-error mb-2">Game Not Found</h1>
          <p class="text-base-content/60 text-lg">
            These are not the games you're looking for.
          </p>
        </div>
        <div class="flex gap-4">
          <button
            class="btn btn-primary"
            @click="$router.push({ name: 'home' })"
          >
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
    </template>

    <!-- Game Details -->
    <template v-else>
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
          <h1
            class="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            Game Details
          </h1>
        </div>
      </div>

      <!-- Game Hero Section -->
      <div
        class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl mb-6"
      >
        <div class="card-body">
          <!-- Game Header -->
          <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6"
          >
            <div class="flex items-center gap-4">
              <div class="avatar">
                <div
                  class="w-20 h-20 rounded-xl ring-4 ring-primary/30 shadow-lg"
                >
                  <img
                    :src="game.icon"
                    :alt="`${game.name} icon`"
                    class="object-cover"
                  />
                </div>
              </div>
              <div>
                <h2 class="text-3xl font-bold text-base-content mb-1">
                  {{ game.name }}
                </h2>
                <div class="flex flex-wrap gap-2">
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
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"
                      />
                    </svg>
                    ID: {{ game.id }}
                  </div>
                  <div class="badge badge-secondary" v-if="game.status">
                    {{ game.status }}
                  </div>
                  <div class="badge badge-accent" v-if="game.type">
                    {{ game.type }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-center lg:justify-end">
              <ActionButtons :showView="false" :game="game" class="scale-110" />
            </div>
          </div>

          <!-- Header Image -->
          <div
            class="relative overflow-hidden rounded-xl shadow-2xl mb-6"
            v-if="game.headerImage"
          >
            <img
              :src="game.headerImage"
              :alt="`${game.name} header`"
              class="w-full h-64 object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
            ></div>
          </div>
        </div>
      </div>

      <!-- Game Keys Section -->
      <div
        class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl mb-6"
        v-if="game.needsKey"
      >
        <div class="card-body">
          <h3 class="card-title text-xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 7a2 2 0 012 2m0 0a2 2 0 01-2 2m2-2h3m-3 0H9m3 0V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2m0 0v6a2 2 0 002 2h4a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2z"
              />
            </svg>
            Game Keys
          </h3>
          <GameKeys :gameId="Number(game.id)" />
        </div>
      </div>

      <!-- Description Section -->
      <div
        class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
      >
        <div class="card-body">
          <h3 class="card-title text-xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-info"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Description
          </h3>
          <div class="prose prose-lg max-w-none">
            <div
              class="bg-base-200/50 p-6 rounded-xl border border-base-300/20 text-base-content leading-relaxed"
              v-html="game.description || 'No description available.'"
            ></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Glass morphism effect */
.card {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Enhanced prose styling */
.prose {
  color: inherit;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: inherit;
}

/* Smooth animations */
.btn {
  transition: all 0.2s ease-in-out;
}

.avatar .w-20 {
  transition: transform 0.3s ease-in-out;
}

.avatar:hover .w-20 {
  transform: scale(1.05);
}
</style>
