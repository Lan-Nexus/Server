<script setup lang="ts">
import { ref, watch, computed } from "vue";
import api from "../utls/api";
import { useRouter } from "vue-router";
import StepImageGrid from "../components/StepImageGrid.vue";
import FileUpload from "../components/gameForm/FileUpload.vue";
import { useGamesStore } from "../stores/games";

const router = useRouter();
const gamesStore = useGamesStore();

// Game type selection
const gameType = ref<string>("");

// Step management
const currentStep = ref(0); // 0: Type selection, 1: Search, 2: Images, 3: Form
const currentImageStep = ref(0);

// Search state
const searchQuery = ref("");
const searchResults = ref<any[]>([]);
let debounceTimeout: any = null;

// Selected game info
const selectedGameInfo = ref<any>(null);
const selectedGameId = ref<string>("");

// Image selections
const selectedIcon = ref<any>(null);
const selectedLogo = ref<any>(null);
const selectedHero = ref<any>(null);
const selectedGrid = ref<any>(null);
const selectedCard = ref<any>(null);

// Form data
const formData = ref({
  gameID: "",
  name: "",
  executable: "",
  description: "",
});

// Archive file for downloadable games
const archiveFile = ref<File | null>(null);

// Processing state
const isProcessing = ref(false);
const uploadProgress = ref(0);

const imageSteps = [
  { key: "icon", label: "Icon" },
  { key: "logo", label: "Logo" },
  { key: "hero", label: "Hero" },
  { key: "grid", label: "Grid" },
  { key: "card", label: "Card" },
];

// Select game type
function selectGameType(type: string) {
  gameType.value = type;
  // Auto-advance to next step
  currentStep.value = 1;
}

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimeout);
  if (!newQuery) {
    searchResults.value = [];
    return;
  }
  debounceTimeout = setTimeout(async () => {
    try {
      const response = await api.post("/api/games/search", { query: newQuery });
      searchResults.value = response.data.results || [];
    } catch (error) {
      console.error("Search error:", error);
      searchResults.value = [];
    }
  }, 300);
});

// Select a game from search results
async function selectGame(game: any) {
  selectedGameId.value = game.id;
  try {
    const response = await api.get(`/api/games/search/${game.id}`);
    selectedGameInfo.value = response.data.data;

    // Pre-fill form data
    formData.value.gameID = game.id;
    formData.value.name = selectedGameInfo.value.game.name;
    formData.value.description = selectedGameInfo.value.game.description || "";

    // Move to image selection step
    currentStep.value = 2;
    currentImageStep.value = 0;
  } catch (error) {
    console.error("Error fetching game details:", error);
  }
}

// Skip to manual entry
function skipToManual() {
  router.push({
    name: "createGame",
    params: { type: gameType.value },
  });
}

// Image step navigation
function nextImageStep() {
  if (currentImageStep.value < imageSteps.length - 1) {
    currentImageStep.value++;
  } else {
    currentStep.value = 3; // Move to form step
  }
}

function prevImageStep() {
  if (currentImageStep.value > 0) {
    currentImageStep.value--;
  }
}

function goBackToImages() {
  if (selectedGameInfo.value) {
    currentStep.value = 2;
  } else {
    currentStep.value = 1;
  }
}

// Check if form is valid
const isFormValid = computed(() => {
  const baseValid = formData.value.gameID && formData.value.name;
  if (gameType.value === "archive") {
    return baseValid && archiveFile.value !== null; // Require archive file for downloadable games
  }
  return baseValid && formData.value.executable;
});

const hasSelectedImages = computed(() => {
  return (
    selectedIcon.value ||
    selectedLogo.value ||
    selectedHero.value ||
    selectedGrid.value ||
    selectedCard.value
  );
});

// Create game (renamed from createShortcut to be more generic)
async function createShortcut() {
  if (!isFormValid.value) return;

  isProcessing.value = true;
  uploadProgress.value = 0;

  try {
    const formDataToSend = new FormData();

    // Add basic fields
    formDataToSend.append("gameID", formData.value.gameID);
    formDataToSend.append("name", formData.value.name);
    formDataToSend.append("executable", formData.value.executable || "");
    formDataToSend.append("description", formData.value.description);
    formDataToSend.append("type", gameType.value);
    formDataToSend.append("status", "Draft");

    // Configure based on game type
    if (gameType.value === "shortcut") {
      formDataToSend.append("needsKey", "0");
      formDataToSend.append("install", "");
      formDataToSend.append("uninstall", "");
      formDataToSend.append("play", "await runDirect(GAME_EXECUTABLE);");
    } else if (gameType.value === "archive") {
      formDataToSend.append("needsKey", "0");
      formDataToSend.append("install", "");
      formDataToSend.append("uninstall", "");
      formDataToSend.append("play", "await run(GAME_EXECUTABLE);");
    }

    // Download and add images if selected (send URLs, server will download them)
    let progress = 10;
    uploadProgress.value = progress;

    if (selectedIcon.value?.url) {
      formDataToSend.append("icon", selectedIcon.value.url);
      progress += 15;
      uploadProgress.value = progress;
    }

    if (selectedLogo.value?.url) {
      formDataToSend.append("logo", selectedLogo.value.url);
      progress += 15;
      uploadProgress.value = progress;
    }

    if (selectedHero.value?.url) {
      formDataToSend.append("heroImage", selectedHero.value.url);
      progress += 15;
      uploadProgress.value = progress;
    }

    if (selectedGrid.value?.url) {
      formDataToSend.append("headerImage", selectedGrid.value.url);
      progress += 15;
      uploadProgress.value = progress;
    }

    if (selectedCard.value?.url) {
      formDataToSend.append("imageCard", selectedCard.value.url);
      progress += 15;
      uploadProgress.value = progress;
    }

    uploadProgress.value = 75;

    // Add archive file if present (for downloadable games)
    if (gameType.value === "archive" && archiveFile.value) {
      formDataToSend.append("archives", archiveFile.value);
    }

    // Create the game
    await api.post("/api/games", formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value =
            75 + Math.round((progressEvent.loaded * 25) / progressEvent.total);
        }
      },
    });

    uploadProgress.value = 100;

    // Refresh games list and navigate
    await gamesStore.getGames();
    router.push({ name: "home" });
  } catch (error: any) {
    console.error("Error creating game:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred";
    alert(`Failed to create game. ${errorMessage}`);
  } finally {
    isProcessing.value = false;
    uploadProgress.value = 0;
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6 pb-24"
  >
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
            Add Game with Images
          </h1>
          <p class="text-base-content/70 mt-2">
            Search for your game, select images, and choose how to add it
          </p>
        </div>
      </div>
    </div>

    <!-- Step 0: Game Type Selection -->
    <div v-if="currentStep === 0" class="space-y-6">
      <!-- Game Type Selection -->
      <div
        class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
      >
        <div class="card-body">
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
              :class="{
                'bg-success/20 border-success': gameType === 'archive',
              }"
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
              :class="{
                'bg-warning/20 border-warning': gameType === 'shortcut',
              }"
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
      </div>
    </div>

    <!-- Step 1: Search for Game -->
    <div v-if="currentStep === 1" class="space-y-6">
      <!-- Search Section -->
      <div
        class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
      >
        <div class="card-body">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-primary/10 rounded-lg">
              <i class="fas fa-search text-primary text-xl"></i>
            </div>
            <h2 class="text-xl font-semibold">Search for Your Game</h2>
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
              placeholder="Search for your game (e.g. 'Counter-Strike', 'Minecraft')..."
              class="input input-bordered w-full pl-10 bg-base-100/80 focus:bg-base-100 transition-all duration-200 text-lg py-3"
            />
            <div
              v-if="searchQuery"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <button
                @click="
                  searchQuery = '';
                  searchResults = [];
                "
                class="btn btn-ghost btn-sm btn-circle hover:btn-error transition-all duration-200"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div class="text-sm text-base-content/60 mt-2">
            <i class="fas fa-info-circle mr-1"></i>
            Search for your game to get images, or skip to enter manually
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div
        v-if="searchResults.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="game in searchResults"
          :key="game.id"
          class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-base-300 hover:border-primary relative"
        >
          <figure v-if="game.image" class="px-4 pt-4">
            <img
              :src="game.image"
              :alt="game.name"
              class="rounded-xl h-32 w-full object-cover"
            />
          </figure>
          <div class="card-body pb-16" :class="{ 'pt-6': !game.image }">
            <h3 class="card-title text-lg">{{ game.name }}</h3>
          </div>
          <button
            @click="selectGame(game)"
            class="btn btn-primary btn-sm absolute bottom-4 right-4 shadow-lg"
          >
            Select <i class="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>

      <!-- Empty States -->
      <div
        v-else-if="searchQuery && searchResults.length === 0"
        class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
      >
        <div
          class="card-body flex flex-col items-center justify-center py-16 text-center"
        >
          <i class="fas fa-search text-8xl text-base-content/30 mb-4"></i>
          <h3 class="text-2xl font-bold mb-2">No Games Found</h3>
          <p class="text-base-content/60 mb-4">
            No games found for "{{ searchQuery }}". Try different keywords or
            skip to enter manually.
          </p>
        </div>
      </div>

      <!-- Skip to Manual Entry -->
      <div class="flex justify-center gap-4">
        <button @click="skipToManual" class="btn btn-outline btn-lg">
          <i class="fas fa-forward mr-2"></i>
          Skip Image Selection (Enter Manually)
        </button>
      </div>
    </div>

    <!-- Step 2: Select Images -->
    <div v-if="currentStep === 2 && selectedGameInfo" class="space-y-6 pb-32">
      <!-- Progress Steps -->
      <div
        class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
      >
        <div class="card-body">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-info/10 rounded-lg">
              <i class="fas fa-images text-info text-xl"></i>
            </div>
            <div>
              <h3 class="text-xl font-semibold">Select Game Images</h3>
              <p class="text-base-content/60 text-sm">
                Choose your preferred assets for
                {{ selectedGameInfo.game.name }}
              </p>
            </div>
          </div>

          <div class="w-full">
            <ul class="steps steps-horizontal w-full">
              <li
                v-for="(step, idx) in imageSteps"
                :key="step.key"
                class="step transition-all duration-300"
                :class="{
                  'step-primary': idx <= currentImageStep,
                  'step-accent': idx === currentImageStep,
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

      <!-- Image Selection Content -->
      <div
        class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
      >
        <div class="card-body">
          <StepImageGrid
            v-if="currentImageStep === 0"
            title="Select an Icon"
            :items="selectedGameInfo.icon"
            :selected="selectedIcon"
            :onSelect="(item: any) => selectedIcon = item"
            imgSize="w-16 h-16"
          />
          <StepImageGrid
            v-else-if="currentImageStep === 1"
            title="Select a Logo"
            :items="selectedGameInfo.logo"
            :selected="selectedLogo"
            :onSelect="(item: any) => selectedLogo = item"
            imgSize="w-42"
          />
          <StepImageGrid
            v-else-if="currentImageStep === 2"
            title="Select a Hero"
            :items="selectedGameInfo.hero"
            :selected="selectedHero"
            :onSelect="(item: any) => selectedHero = item"
            imgSize="w-42"
          />
          <StepImageGrid
            v-else-if="currentImageStep === 3"
            title="Select a Grid"
            :items="selectedGameInfo.grid"
            :selected="selectedGrid"
            :onSelect="(item: any) => selectedGrid = item"
            imgSize="w-42"
          />
          <StepImageGrid
            v-else-if="currentImageStep === 4"
            title="Select a Card"
            :items="selectedGameInfo.card"
            :selected="selectedCard"
            :onSelect="(item: any) => selectedCard = item"
            imgSize="w-42"
          />
        </div>
      </div>

      <!-- Fixed Image Navigation Controls -->
      <div
        class="fixed bottom-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur-sm border-t border-base-300/20 shadow-xl"
      >
        <div class="container mx-auto p-6">
          <div class="flex justify-between items-center">
            <button
              @click="prevImageStep"
              :disabled="currentImageStep === 0"
              class="btn btn-outline gap-2 btn-lg"
              :class="{ 'btn-disabled': currentImageStep === 0 }"
            >
              <i class="fas fa-chevron-left"></i>
              Back
            </button>

            <div class="text-center px-4">
              <div class="text-sm text-base-content/60 mb-1">
                Step {{ currentImageStep + 1 }} of {{ imageSteps.length }}
              </div>
              <div class="text-lg font-semibold">
                {{ imageSteps[currentImageStep].label }}
              </div>
            </div>

            <button
              @click="nextImageStep"
              class="btn btn-primary gap-2 btn-lg shadow-lg"
            >
              {{
                currentImageStep === imageSteps.length - 1
                  ? "Continue to Details"
                  : "Next"
              }}
              <i
                v-if="currentImageStep !== imageSteps.length - 1"
                class="fas fa-chevron-right"
              ></i>
              <i v-else class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Game Details Form -->
    <div v-if="currentStep === 3" class="space-y-6">
      <div
        class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
      >
        <div class="card-body">
          <!-- Form Header -->
          <div
            class="flex items-center gap-3 mb-6 pb-4 border-b border-base-300/20"
          >
            <div
              class="p-3 rounded-xl"
              :class="{
                'bg-success/10': gameType === 'archive',
                'bg-warning/10': gameType === 'shortcut',
              }"
            >
              <i
                class="text-xl"
                :class="{
                  'fas fa-download text-success': gameType === 'archive',
                  'fas fa-external-link-alt text-warning':
                    gameType === 'shortcut',
                }"
              ></i>
            </div>
            <div>
              <h3 class="text-xl font-semibold">
                {{
                  gameType === "archive"
                    ? "Downloadable Game Details"
                    : "Shortcut Details"
                }}
              </h3>
              <p class="text-base-content/60 text-sm">
                {{
                  gameType === "archive"
                    ? "Configure installation and gameplay"
                    : `Configure the shortcut for ${
                        formData.name || "your game"
                      }`
                }}
              </p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-6" v-if="isProcessing">
            <div class="flex items-center gap-3 mb-2">
              <i class="fas fa-sync-alt text-primary animate-spin"></i>
              <span class="text-sm font-medium">
                {{
                  gameType === "archive"
                    ? "Creating game..."
                    : "Creating shortcut..."
                }}
              </span>
              <span class="text-xs text-base-content/60" v-if="uploadProgress">
                {{ Math.round(uploadProgress) }}%
              </span>
            </div>
            <progress
              class="progress progress-primary w-full"
              :value="uploadProgress || 0"
              max="100"
            ></progress>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Game ID</legend>
              <input
                type="text"
                v-model="formData.gameID"
                class="input input-bordered w-full"
                placeholder="e.g. counter-strike-2"
              />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Name</legend>
              <input
                type="text"
                v-model="formData.name"
                class="input input-bordered w-full"
                placeholder="Game name"
              />
            </fieldset>

            <fieldset class="fieldset" v-if="gameType !== 'archive'">
              <legend class="fieldset-legend">Executable Path</legend>
              <input
                type="text"
                v-model="formData.executable"
                class="input input-bordered w-full"
                placeholder="e.g. C:\\Program Files\\Game\\game.exe"
              />
              <div class="alert alert-info mt-2">
                <i class="fas fa-info-circle"></i>
                <div class="text-sm">
                  <strong>Provide the full path to the executable</strong><br />
                  Example: C:\Program Files\Game\game.exe<br />
                  <small class="opacity-70"
                    >The system will automatically track when this game is
                    running.</small
                  >
                </div>
              </div>
            </fieldset>

            <fieldset class="fieldset" v-if="gameType === 'archive'">
              <legend class="fieldset-legend">Executable Name</legend>
              <input
                type="text"
                v-model="formData.executable"
                class="input input-bordered w-full"
                placeholder="e.g. game.exe"
              />
              <div class="alert alert-info mt-2">
                <i class="fas fa-info-circle"></i>
                <div class="text-sm">
                  <strong>Provide the executable filename</strong><br />
                  Example: game.exe<br />
                  <small class="opacity-70"
                    >The name of the .exe file within the game archive.</small
                  >
                </div>
              </div>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Description (Optional)</legend>
              <textarea
                v-model="formData.description"
                class="textarea textarea-bordered w-full"
                rows="4"
                placeholder="Add a description for this game..."
              ></textarea>
            </fieldset>

            <!-- Archive Upload for Downloadable Games -->
            <fieldset class="fieldset" v-if="gameType === 'archive'">
              <legend class="fieldset-legend">Game Archive</legend>
              <FileUpload v-model="archiveFile" />
              <div class="alert alert-info mt-2">
                <i class="fas fa-info-circle"></i>
                <div class="text-sm">
                  <strong>Upload a game archive file</strong><br />
                  Supported formats: .zip<br />
                  <small class="opacity-70"
                    >Upload the game files that will be installed on the
                    client.</small
                  >
                </div>
              </div>
            </fieldset>

            <!-- Show selected images preview -->
            <div v-if="hasSelectedImages" class="mt-6">
              <h4 class="text-lg font-semibold mb-4">
                Selected Images Preview
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div v-if="selectedIcon" class="text-center">
                  <div class="p-2 bg-base-200 rounded-lg">
                    <img
                      :src="selectedIcon.url"
                      alt="Icon"
                      class="w-16 h-16 mx-auto rounded"
                    />
                  </div>
                  <p class="text-xs mt-1">Icon</p>
                </div>
                <div v-if="selectedLogo" class="text-center">
                  <div class="p-2 bg-base-200 rounded-lg">
                    <img
                      :src="selectedLogo.url"
                      alt="Logo"
                      class="w-full h-16 object-contain rounded"
                    />
                  </div>
                  <p class="text-xs mt-1">Logo</p>
                </div>
                <div v-if="selectedHero" class="text-center">
                  <div class="p-2 bg-base-200 rounded-lg">
                    <img
                      :src="selectedHero.url"
                      alt="Hero"
                      class="w-full h-16 object-cover rounded"
                    />
                  </div>
                  <p class="text-xs mt-1">Hero</p>
                </div>
                <div v-if="selectedGrid" class="text-center">
                  <div class="p-2 bg-base-200 rounded-lg">
                    <img
                      :src="selectedGrid.url"
                      alt="Grid"
                      class="w-full h-16 object-cover rounded"
                    />
                  </div>
                  <p class="text-xs mt-1">Grid</p>
                </div>
                <div v-if="selectedCard" class="text-center">
                  <div class="p-2 bg-base-200 rounded-lg">
                    <img
                      :src="selectedCard.url"
                      alt="Card"
                      class="w-full h-16 object-cover rounded"
                    />
                  </div>
                  <p class="text-xs mt-1">Card</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between mt-6">
            <button
              @click="goBackToImages"
              class="btn btn-outline gap-2"
              :disabled="isProcessing"
            >
              <i class="fas fa-arrow-left"></i>
              {{ selectedGameInfo ? "Back to Images" : "Back to Search" }}
            </button>
            <button
              @click="createShortcut"
              class="btn btn-primary gap-2"
              :disabled="isProcessing || !isFormValid"
            >
              <template v-if="isProcessing">
                <span class="loading loading-spinner"></span>
                {{ uploadProgress ? uploadProgress + "%" : "Processing..." }}
              </template>
              <template v-else>
                <i class="fas fa-check"></i>
                {{ gameType === "archive" ? "Create Game" : "Create Shortcut" }}
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fieldset {
  margin-bottom: 1rem;
}

.fieldset-legend {
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}
</style>
