<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Game Selection -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-semibold flex items-center gap-2">
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
              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"
            />
          </svg>
          Game *
        </span>
      </label>
      <select
        v-model.number="form.gameId"
        @change="updateGameName"
        class="select select-bordered w-full bg-base-100/80 focus:bg-base-100 transition-all duration-200"
        required
      >
        <option value="">Select a game</option>
        <option v-for="game in games" :key="game.id" :value="game.id">
          {{ game.name }}
        </option>
      </select>
    </div>

    <!-- Time Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Start Time -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Start Time *
          </span>
        </label>
        <input
          type="datetime-local"
          v-model="form.startTime"
          class="input input-bordered w-full bg-base-100/80 focus:bg-base-100 transition-all duration-200"
          required
        />
      </div>

      <!-- End Time -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            End Time *
          </span>
        </label>
        <input
          type="datetime-local"
          v-model="form.endTime"
          class="input input-bordered w-full bg-base-100/80 focus:bg-base-100 transition-all duration-200"
          required
        />
      </div>
    </div>

    <!-- Status -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-semibold flex items-center gap-2">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Status
        </span>
      </label>
      <select
        v-model="form.status"
        class="select select-bordered w-full bg-base-100/80 focus:bg-base-100 transition-all duration-200"
      >
        <option value="active">
          🟢 Active (status will be auto-computed from dates)
        </option>
        <option value="cancelled">❌ Cancelled</option>
      </select>
      <div class="label">
        <span class="label-text-alt text-base-content/60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3 inline mr-1"
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
          Status is automatically determined by start/end times unless cancelled
        </span>
      </div>
    </div>

    <!-- Description -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-semibold flex items-center gap-2">
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
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"
            />
          </svg>
          Description
        </span>
      </label>
      <textarea
        v-model="form.description"
        class="textarea textarea-bordered w-full h-24 bg-base-100/80 focus:bg-base-100 transition-all duration-200 resize-none"
        placeholder="Enter event description (optional)..."
      ></textarea>
    </div>

    <!-- Form Actions -->
    <div class="flex gap-4 justify-end pt-4 border-t border-base-300/20">
      <button
        type="button"
        @click="$emit('cancel')"
        class="btn btn-outline btn-lg gap-2 hover:btn-error transition-all duration-200"
        :disabled="isLoading"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn-primary btn-lg gap-2 min-w-32"
        :disabled="isLoading || !isFormValid"
      >
        <span
          v-if="isLoading"
          class="loading loading-spinner loading-sm"
        ></span>
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
        {{ submitText }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useGamesStore, type getGameType } from "@/stores/games";
import type { CreateEventType, GameEvent } from "@/stores/events";

interface Props {
  event?: GameEvent;
  isLoading?: boolean;
  submitText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  submitText: "Create Event",
});

const emit = defineEmits<{
  submit: [event: CreateEventType];
  cancel: [];
}>();

const gamesStore = useGamesStore();

const form = ref<CreateEventType>({
  gameId: 0,
  gameName: "",
  startTime: "",
  endTime: "",
  status: "active",
  description: "",
});

const games = ref<getGameType[]>([]);

const isFormValid = computed(() => {
  const valid =
    form.value.gameId > 0 &&
    form.value.gameName.trim() !== "" &&
    form.value.startTime !== "" &&
    form.value.endTime !== "" &&
    new Date(form.value.startTime) < new Date(form.value.endTime);

  return valid;
});

function updateGameName() {
  const selectedGame = games.value.find(
    (game) => game.id === form.value.gameId
  );
  if (selectedGame) {
    form.value.gameName = selectedGame.name;
  }
}

function handleSubmit() {
  if (isFormValid.value) {
    // Convert datetime-local format to ISO string
    const eventData = {
      ...form.value,
      startTime: new Date(form.value.startTime).toISOString(),
      endTime: new Date(form.value.endTime).toISOString(),
    };
    emit("submit", eventData);
  }
}

// Convert ISO string to datetime-local format
function formatDateTimeLocal(isoString: string | Date): string {
  if (!isoString) return "";
  const date = typeof isoString === "string" ? new Date(isoString) : isoString;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Initialize form with event data if editing
watch(
  () => props.event,
  (newEvent) => {
    if (newEvent) {
      form.value = {
        gameId: newEvent.gameId,
        gameName: newEvent.gameName,
        startTime: formatDateTimeLocal(newEvent.startTime),
        endTime: formatDateTimeLocal(newEvent.endTime),
        status: newEvent.status,
        description: newEvent.description || "",
      };
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await gamesStore.getGames();
  games.value = gamesStore.games;
});
</script>
