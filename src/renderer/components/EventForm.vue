<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Game Selection -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-semibold flex items-center gap-2">
          <i class="fas fa-calendar-alt text-primary"></i>
          Game *
        </span>
      </label>
      <select
        v-model.number="form.gameId"
        @change="updateGameName"
        class="select select-bordered w-full bg-base-100/80 focus:bg-base-100 transition-all duration-200"
        :class="{
          'border-red-500': !form.gameId,
        }"
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
            <i class="fas fa-play-circle text-success"></i>
            Start Time *
          </span>
        </label>
        <input
          type="datetime-local"
          v-model="form.startTime"
          class="input input-bordered w-full bg-base-100/80 focus:bg-base-100 transition-all duration-200"
          :class="{
            'border-red-500': !isDatesRight,
          }"
          required
        />
      </div>

      <!-- End Time -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold flex items-center gap-2">
            <i class="fas fa-stop-circle text-error"></i>
            End Time *
          </span>
        </label>
        <input
          type="datetime-local"
          v-model="form.endTime"
          class="input input-bordered w-full bg-base-100/80 focus:bg-base-100 transition-all duration-200"
          :class="{
            'border-red-500': !isDatesRight,
          }"
          required
        />
      </div>
    </div>

    <!-- Status -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-semibold flex items-center gap-2">
          <i class="fas fa-check-circle text-warning"></i>
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
          <i class="fas fa-info-circle text-xs mr-1"></i>
          Status is automatically determined by start/end times unless cancelled
        </span>
      </div>
    </div>

    <!-- Description -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-semibold flex items-center gap-2">
          <i class="fas fa-comment-alt text-accent"></i>
          Description
        </span>
      </label>
      <textarea
        v-model="form.description"
        class="textarea textarea-bordered w-full h-24 bg-base-100/80 focus:bg-base-100 transition-all duration-200 resize-none"
        placeholder="Enter event description (optional)..."
        :class="{
          'border-red-500': form.description == '',
        }"
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
        <i class="fas fa-times"></i>
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn-primary btn-lg gap-2 min-w-32"
        :disabled="isLoading || !isFormValid"
      >
        <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
        <i v-else class="fas fa-check"></i>
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

const isDatesRight = computed(() => {
  return new Date(form.value.startTime) < new Date(form.value.endTime);
});

const isFormValid = computed(() => {
  const valid =
    form.value.gameId > 0 &&
    form.value.gameName.trim() !== "" &&
    form.value.startTime !== "" &&
    form.value.endTime !== "" &&
    isDatesRight.value;
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
