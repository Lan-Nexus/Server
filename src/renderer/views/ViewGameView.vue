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
          <i class="fas fa-gamepad text-error text-6xl mb-4"></i>
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
            <i class="fas fa-home mr-2"></i>
            Go Home
          </button>
          <button class="btn btn-outline" @click="$router.go(-1)">
            <i class="fas fa-arrow-left mr-2"></i>
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
            <i class="fas fa-arrow-left"></i>
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
                    <i class="fas fa-hashtag mr-1"></i>
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
            <i class="fas fa-key text-warning"></i>
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
            <i class="fas fa-file-alt text-info"></i>
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
