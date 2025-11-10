<script setup lang="ts">
import { useGamesStore } from "@/stores/games";
import ActionButtons from "@/components/games/ActionButtons.vue";
import GameKeys from "@/components/games/GameKeys.vue";
import { useRoute } from "vue-router";
import { ref, type Ref, onMounted, onUpdated, onUnmounted } from "vue";
import api from "@/utls/api";

const route = useRoute();
const gamesStore = useGamesStore();

const id = ref(route.params.id) as Ref<string>;
let game = gamesStore.getGameById(Number(id.value));

const keys = ref([]);
const height = ref("0px");
const widthOrHeight = ref<string>();
const logoElement = ref<HTMLElement | null>(null);
const heroImageElement = ref<HTMLElement | null>(null);
const backButtonOpacity = ref(1);
const parallaxContainer = ref<HTMLElement | null>(null);

function updateHeight() {
  // Calculate height based on viewport width and 1920:620 aspect ratio
  const viewportWidth = window.innerWidth;
  const calculatedHeight = (viewportWidth * 620) / 1920; // Full hero image height
  height.value = calculatedHeight + "px";
  console.log(
    "Viewport width:",
    viewportWidth,
    "Calculated logo container height:",
    height.value
  );
}

function handleScroll() {
  if (!parallaxContainer.value || !heroImageElement.value) return;

  const scrollTop = parallaxContainer.value.scrollTop;
  const heroHeight = heroImageElement.value.clientHeight;
  const fadeStart = heroHeight * 0.3; // Start fading at 30% of hero height
  const fadeEnd = heroHeight * 0.5; // Fully faded at 50% of hero height

  if (scrollTop < fadeStart) {
    backButtonOpacity.value = 1;
  } else if (scrollTop > fadeEnd) {
    backButtonOpacity.value = 0;
  } else {
    // Linear fade between fadeStart and fadeEnd
    backButtonOpacity.value =
      1 - (scrollTop - fadeStart) / (fadeEnd - fadeStart);
  }
}

function getLogoSize() {
  const logoHeight = logoElement.value?.children[0]?.clientHeight;
  const logoWidth = logoElement.value?.children[0]?.clientWidth;
  console.log("Logo dimensions - height:", logoHeight, "width:", logoWidth);
  if (!logoHeight || !logoWidth) {
    widthOrHeight.value = "w-1/2";
    return;
  }
  if (logoHeight > logoWidth) {
    widthOrHeight.value = "h-1/2";
    return;
  }
  widthOrHeight.value = "w-1/2";
}

onMounted(() => {
  window.addEventListener("resize", updateHeight);
  updateHeight(); // Calculate immediately on mount
  setTimeout(() => {
    updateHeight();
    getLogoSize();
    // Set up scroll listener after elements are ready
    if (parallaxContainer.value) {
      parallaxContainer.value.addEventListener("scroll", handleScroll);
      // Ensure we're at the top
      parallaxContainer.value.scrollTop = 0;
    }
  }, 100);
  // Additional check after a longer delay for slower loading images
  setTimeout(() => {
    updateHeight();
    getLogoSize();
  }, 500);
});

onUpdated(() => {
  updateHeight();
  getLogoSize();
});

onUnmounted(() => {
  window.removeEventListener("resize", updateHeight);
  if (parallaxContainer.value) {
    parallaxContainer.value.removeEventListener("scroll", handleScroll);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
    <!-- Game Not Found State -->
    <template v-if="!game">
      <div
        class="flex flex-col items-center justify-center min-h-[60vh] text-center p-6"
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

    <!-- Game Details with Parallax -->
    <template v-else>
      <div ref="parallaxContainer" class="parallax">
        <!-- Back Button (Sticky positioned in top left until scrolled past hero) -->
        <div
          class="sticky top-6 left-6 z-50 float-left ml-6 transition-opacity duration-300"
          :style="{ opacity: backButtonOpacity }"
        >
          <button
            @click="$router.go(-1)"
            class="btn btn-circle btn-ghost bg-base-100/80 backdrop-blur-sm hover:btn-primary transition-all duration-200 shadow-lg"
          >
            <i class="fas fa-arrow-left"></i>
          </button>
        </div>

        <!-- Parallax Background Layer -->
        <div class="parallax__layer parallax__layer--back">
          <div ref="heroImageElement" class="w-full bg-error">
            <img
              v-if="game.heroImage"
              :src="game.heroImage"
              :alt="`${game.name} hero`"
              class="w-full"
              @load="updateHeight"
            />
            <img
              v-else-if="game.headerImage"
              :src="game.headerImage"
              :alt="`${game.name} header`"
              class="w-full"
              @load="updateHeight"
            />
            <div
              v-else
              class="w-full bg-gradient-to-br from-primary/30 to-secondary/30"
              style="aspect-ratio: 16 / 5.1"
            ></div>
          </div>
        </div>

        <!-- Logo Layer -->
        <div ref="logoElement" class="relative w-full logo">
          <img
            v-if="game.logo"
            :src="game.logo"
            :alt="`${game.name} logo`"
            :class="widthOrHeight"
            class="absolute bottom-5 left-5"
            @load="getLogoSize"
          />
          <div
            v-else-if="!game.logo"
            style="text-shadow: 2px 2px 2px black"
            class="absolute bottom-5 left-5 text-5xl text-white font-bold"
          >
            {{ game.name }}
          </div>
        </div>

        <!-- Parallax Foreground Layer (Content) -->
        <div class="parallax__layer parallax__layer--base">
          <div class="content-container bg-base-200">
            <!-- Action Bar -->
            <div class="bg-base-200 p-6 shadow-lg">
              <div
                class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
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
                    <h3 class="text-2xl font-bold text-base-content mb-1">
                      {{ game.name }}
                    </h3>
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
                  <ActionButtons
                    :showView="false"
                    :game="game"
                    class="scale-110"
                  />
                </div>
              </div>
            </div>

            <!-- Main Content Area -->
            <div class="p-6 flex flex-col lg:flex-row gap-6">
              <!-- Left Column: Description and Images -->
              <div class="flex-1">
                <!-- Description Section -->
                <div
                  class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl mb-6"
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

                <!-- Additional Images Gallery -->
                <div
                  class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
                  v-if="game.imageCard || game.headerImage || game.heroImage"
                >
                  <div class="card-body">
                    <h3 class="card-title text-xl mb-4">
                      <i class="fas fa-images text-primary"></i>
                      Media Gallery
                    </h3>
                    <div
                      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      <div
                        class="relative overflow-hidden rounded-lg shadow-lg"
                        v-if="game.imageCard"
                      >
                        <img
                          :src="game.imageCard"
                          :alt="`${game.name} card`"
                          class="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div
                          class="absolute top-2 left-2 badge badge-sm badge-primary"
                        >
                          Card Image
                        </div>
                      </div>
                      <div
                        class="relative overflow-hidden rounded-lg shadow-lg"
                        v-if="game.headerImage"
                      >
                        <img
                          :src="game.headerImage"
                          :alt="`${game.name} header`"
                          class="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div
                          class="absolute top-2 left-2 badge badge-sm badge-secondary"
                        >
                          Header Image
                        </div>
                      </div>
                      <div
                        class="relative overflow-hidden rounded-lg shadow-lg"
                        v-if="game.heroImage"
                      >
                        <img
                          :src="game.heroImage"
                          :alt="`${game.name} hero`"
                          class="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div
                          class="absolute top-2 left-2 badge badge-sm badge-accent"
                        >
                          Hero Image
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Game Keys (if applicable) -->
              <div class="w-full lg:w-96" v-if="game.needsKey">
                <div
                  class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl sticky top-6"
                >
                  <div class="card-body">
                    <h3 class="card-title text-xl mb-4">
                      <i class="fas fa-key text-warning"></i>
                      Game Keys
                    </h3>
                    <GameKeys :gameId="Number(game.id)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Parallax Container */
.parallax {
  perspective: 1px;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.parallax__layer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.parallax__layer--base {
  transform: translateZ(0);
}

.parallax__layer--back {
  transform: translateZ(-0.5px) scale(1.5);
  width: 100%;
  left: 0;
  top: 0;
}

/* Logo positioning */
.logo {
  height: v-bind(height);
  position: relative;
  z-index: 10;
}

/* Content container positioning */
.content-container {
  margin-top: 32%;
  min-height: 100vh;
}

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

/* Ensure images in gallery have proper aspect ratio */
.grid img {
  object-fit: cover;
}
</style>
