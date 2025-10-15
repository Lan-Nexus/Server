<template>
  <div
    v-if="newGame.gameInfo"
    class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6 pb-24"
  >
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
            Add Game
          </h1>
          <h2 class="text-xl text-base-content/80 mt-2">
            {{ newGame.gameInfo.game.name }}
          </h2>
        </div>
      </div>
    </div>

    <!-- Progress Steps -->
    <div
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl mb-8"
    >
      <div class="card-body">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-info/10 rounded-lg">
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-semibold">Game Setup Progress</h3>
            <p class="text-base-content/60 text-sm">
              Select your preferred assets for this game
            </p>
          </div>
        </div>

        <div class="w-full">
          <ul class="steps steps-horizontal w-full">
            <li
              v-for="(step, idx) in steps"
              :key="step.key"
              class="step transition-all duration-300"
              :class="{
                'step-primary': idx <= currentStep,
                'step-accent': idx === currentStep,
              }"
            >
              <div class="flex flex-col items-center">
                <div class="text-xs mt-1 font-medium">{{ step.label }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl mb-6"
    >
      <div class="card-body">
        <StepImageGrid
          v-if="currentStep === 0"
          title="Select an Icon"
          :items="newGame.gameInfo.icon"
          :selected="newGame.selectedIcon"
          :onSelect="(item) => newGame.setSelectedIcon(item)"
          imgSize="w-16 h-16"
        />
        <StepImageGrid
          v-else-if="currentStep === 1"
          title="Select a Logo"
          :items="newGame.gameInfo.logo"
          :selected="newGame.selectedLogo"
          :onSelect="(item) => newGame.setSelectedLogo(item)"
          imgSize="w-42"
        />
        <StepImageGrid
          v-else-if="currentStep === 2"
          title="Select a Hero"
          :items="newGame.gameInfo.hero"
          :selected="newGame.selectedHero"
          :onSelect="(item) => newGame.setSelectedHero(item)"
          imgSize="w-42"
        />
        <StepImageGrid
          v-else-if="currentStep === 3"
          title="Select a Grid"
          :items="newGame.gameInfo.grid"
          :selected="newGame.selectedGrid"
          :onSelect="(item) => newGame.setSelectedGrid(item)"
          imgSize="w-42"
        />
        <StepImageGrid
          v-else-if="currentStep === 4"
          title="Select a Card"
          :items="newGame.gameInfo.card"
          :selected="newGame.selectedCard"
          :onSelect="(item) => newGame.setSelectedCard(item)"
          imgSize="w-42"
        />
      </div>
    </div>

    <!-- Fixed Navigation Controls -->
    <div
      class="fixed bottom-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur-sm border-t border-base-300/20 shadow-xl"
    >
      <div class="container mx-auto p-6">
        <div class="flex justify-between items-center">
          <button
            @click="prevStep"
            :disabled="currentStep === 0"
            class="btn btn-outline gap-2 btn-lg"
            :class="{ 'btn-disabled': currentStep === 0 }"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
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
            Back
          </button>

          <div class="text-center px-4">
            <div class="text-sm text-base-content/60 mb-1">
              Step {{ currentStep + 1 }} of {{ steps.length }}
            </div>
            <div class="text-lg font-semibold">
              {{ steps[currentStep].label }}
            </div>
          </div>

          <button
            @click="nextStep"
            class="btn btn-primary gap-2 btn-lg shadow-lg"
          >
            {{ currentStep === steps.length - 1 ? "Finish" : "Next" }}
            <svg
              v-if="currentStep !== steps.length - 1"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../utls/api";
import { useRouter } from "vue-router";
import StepImageGrid from "../components/StepImageGrid.vue";
import { useGamesStore } from "../stores/games";
import { useNewGameStore } from "../stores/newGame";

const router = useRouter();
const gamesStore = useGamesStore();

const newGame = useNewGameStore();

const steps = [
  { key: "icon", label: "Icon" },
  { key: "logo", label: "Logo" },
  { key: "hero", label: "Hero" },
  { key: "grid", label: "Grid" },
  { key: "card", label: "Card" },
];

const currentStep = ref(0);

function save() {
  newGame.save(gamesStore, router);
}

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  } else if (currentStep.value === steps.length - 1) {
    save();
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

onMounted(async () => {
  const route = router.currentRoute.value;
  newGame.setGameId(route.params.gameId);
  try {
    const response = await api.get(`/api/games/search/${newGame.gameId}`);
    newGame.setGameInfo(response.data.data);
  } catch (error) {
    console.error("Error fetching game details:", error);
  }
});
</script>
