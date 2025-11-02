<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1
            class="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            Events Management
          </h1>
          <p class="text-base-content/70 mt-2">
            {{ filteredEvents.length }}
            {{ filteredEvents.length === 1 ? "event" : "events" }} found
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="$emit('import')"
            class="btn btn-accent btn-lg gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <i class="fas fa-file-import"></i>
            Import Calendar
          </button>
          <button
            @click="$emit('create')"
            class="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <i class="fas fa-plus"></i>
            Create New Event
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
    >
      <div class="card-body">
        <h3 class="card-title text-xl mb-4">
          <div class="p-2 bg-info/10 rounded-lg">
            <i class="fas fa-filter text-info"></i>
          </div>
          Filters & Search
        </h3>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold flex items-center gap-2">
                <i class="fas fa-check-circle text-primary"></i>
                Status
              </span>
            </label>
            <select
              v-model="statusFilter"
              class="select select-bordered w-full bg-base-100/80 focus:bg-base-100 transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="upcoming">🕒 Upcoming</option>
              <option value="active">🔴 Active</option>
              <option value="completed">✅ Completed</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold flex items-center gap-2">
                <i class="fas fa-gamepad text-secondary"></i>
                Game
              </span>
            </label>
            <select
              v-model="gameFilter"
              class="select select-bordered w-full bg-base-100/80 focus:bg-base-100 transition-all duration-200"
            >
              <option value="">All Games</option>
              <option
                v-for="game in uniqueGames"
                :key="game.gameId"
                :value="game.gameId"
              >
                🎮 {{ game.gameName }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold flex items-center gap-2">
                <i class="fas fa-bolt text-accent"></i>
                Quick Actions
              </span>
            </label>
            <div class="join w-full">
              <button
                @click="statusFilter = 'upcoming'"
                class="btn btn-outline btn-sm join-item flex-1 hover:btn-primary transition-all duration-200"
              >
                Upcoming
              </button>
              <button
                @click="statusFilter = 'active'"
                class="btn btn-outline btn-sm join-item flex-1 hover:btn-secondary transition-all duration-200"
              >
                Active
              </button>
              <button
                @click="clearFilters"
                class="btn btn-outline btn-sm join-item flex-1 hover:btn-accent transition-all duration-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
    >
      <div class="card-body flex flex-col items-center justify-center py-16">
        <span
          class="loading loading-spinner loading-lg text-primary mb-4"
        ></span>
        <h3 class="text-xl font-semibold mb-2">Loading Events</h3>
        <p class="text-base-content/60">
          Please wait while we fetch your events...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="card bg-base-100/50 backdrop-blur-sm border border-error/20 shadow-xl"
    >
      <div class="card-body">
        <div class="alert alert-error">
          <i class="fas fa-exclamation-circle"></i>
          <div>
            <h3 class="font-bold">Error Loading Events!</h3>
            <div class="text-sm opacity-80">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredEvents.length === 0"
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
    >
      <div
        class="card-body flex flex-col items-center justify-center py-16 text-center"
      >
        <div class="max-w-md">
          <i
            class="fas fa-calendar-times text-8xl text-base-content/30 mx-auto mb-4 block"
          ></i>
          <h3 class="text-2xl font-bold mb-2">No Events Found</h3>
          <p class="text-base-content/60 mb-6">
            {{
              statusFilter || gameFilter
                ? "Try adjusting your filters, import from a calendar, or create a new event."
                : "Get started by creating your first gaming event or importing from a calendar!"
            }}
          </p>
          <div class="flex gap-3 justify-center">
            <button
              @click="$emit('import')"
              class="btn btn-accent btn-lg gap-2"
            >
              <i class="fas fa-file-import"></i>
              Import Calendar
            </button>
            <button
              @click="$emit('create')"
              class="btn btn-primary btn-lg gap-2"
            >
              <i class="fas fa-plus"></i>
              Create Your First Event
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Events Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
        :class="{
          'ring-2 ring-success/50 bg-success/5':
            getDisplayStatus(event) === 'active',
          'ring-2 ring-info/50 bg-info/5':
            getDisplayStatus(event) === 'upcoming',
          'opacity-75 grayscale': getDisplayStatus(event) === 'cancelled',
        }"
      >
        <div class="card-body p-6">
          <!-- Game Title with Enhanced Design -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="avatar">
                <div
                  class="w-12 h-12 rounded-xl ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-200 bg-gradient-to-br from-primary/10 to-secondary/10"
                >
                  <img
                    v-if="event.gameIcon"
                    :src="event.gameIcon"
                    :alt="event.gameName"
                    class="w-full h-full rounded-xl object-cover"
                    @error="(e) => (e.target as HTMLImageElement).style.display='none'"
                  />
                  <img
                    v-else-if="event.gameLogo"
                    :src="event.gameLogo"
                    :alt="event.gameName"
                    class="w-full h-full rounded-xl object-cover"
                    @error="(e) => (e.target as HTMLImageElement).style.display='none'"
                  />
                  <img
                    v-else-if="event.gameImageCard"
                    :src="event.gameImageCard"
                    :alt="event.gameName"
                    class="w-full h-full rounded-xl object-cover"
                    @error="(e) => (e.target as HTMLImageElement).style.display='none'"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-2xl"
                  >
                    🎮
                  </div>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h2
                  class="text-xl font-bold text-base-content truncate group-hover:text-primary transition-colors duration-200"
                >
                  {{ event.gameName }}
                </h2>
                <div class="flex items-center gap-2 mt-1">
                  <div class="badge badge-primary badge-sm">Gaming Event</div>
                </div>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="flex-shrink-0">
              <div
                class="badge badge-lg font-semibold"
                :class="[
                  getStatusBadgeClass(event),
                  { 'animate-pulse': getDisplayStatus(event) === 'active' },
                ]"
              >
                <div class="flex items-center gap-1">
                  <!-- Status Icon -->
                  <i
                    v-if="getDisplayStatus(event) === 'active'"
                    class="fas fa-broadcast-tower"
                  ></i>
                  <i
                    v-else-if="getDisplayStatus(event) === 'upcoming'"
                    class="fas fa-clock"
                  ></i>
                  <i
                    v-else-if="getDisplayStatus(event) === 'completed'"
                    class="fas fa-check-circle"
                  ></i>
                  <i v-else class="fas fa-times-circle"></i>
                  {{ getDisplayStatus(event) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Event Details -->
          <div class="space-y-4 mb-6">
            <!-- Time Information Card -->
            <div
              class="bg-base-200/50 rounded-xl p-4 border border-base-300/10"
            >
              <div class="flex items-center gap-2 text-sm mb-3">
                <div class="p-1 bg-primary/10 rounded-lg">
                  <i class="fas fa-clock text-primary"></i>
                </div>
                <span class="font-semibold text-primary">Event Schedule</span>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-sm">
                  <span class="font-medium">Start:</span>
                  <span class="text-base-content/80">{{
                    formatDateTime(event.startTime)
                  }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="font-medium">End:</span>
                  <span class="text-base-content/80">{{
                    formatDateTime(event.endTime)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Duration Badge -->
            <div class="flex justify-center">
              <div class="badge badge-secondary badge-lg gap-2 px-4 py-2">
                <i class="fas fa-hourglass-half"></i>
                Duration:
                {{ calculateDuration(event.startTime, event.endTime) }}
              </div>
            </div>

            <!-- Description Card -->
            <div
              v-if="event.description"
              class="bg-base-200/50 rounded-xl p-4 border border-base-300/10"
            >
              <div class="flex items-start gap-2">
                <div class="p-1 bg-accent/10 rounded-lg mt-0.5">
                  <i class="fas fa-file-alt text-secondary"></i>
                </div>
                <div class="text-sm leading-relaxed text-base-content/80">
                  {{ event.description }}
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 pt-4 border-t border-base-300/20">
            <!-- Cancel/Reactivate Button -->
            <div
              class="tooltip"
              :data-tip="
                event.status !== 'cancelled'
                  ? 'Cancel Event'
                  : 'Reactivate Event'
              "
            >
              <button
                v-if="event.status !== 'cancelled'"
                @click="updateStatus(event.id!, 'cancelled')"
                class="btn btn-warning btn-sm gap-2 flex-1"
              >
                <i class="fas fa-times"></i>
                Cancel
              </button>
              <button
                v-else
                @click="updateStatus(event.id!, 'active')"
                class="btn btn-success btn-sm gap-2 flex-1"
              >
                <i class="fas fa-check"></i>
                Activate
              </button>
            </div>

            <!-- Edit Button -->
            <div class="tooltip" data-tip="Edit Event">
              <button
                @click="$emit('edit', event)"
                class="btn btn-primary btn-sm gap-2 flex-1"
              >
                <i class="fas fa-edit"></i>
                Edit
              </button>
            </div>

            <!-- Delete Button -->
            <div class="tooltip" data-tip="Delete Event">
              <button
                @click="confirmDelete(event)"
                class="btn btn-error btn-sm gap-2"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="eventToDelete" class="modal modal-open">
      <div class="modal-box max-w-md">
        <!-- Modal Header -->
        <div class="flex items-center gap-3 mb-4">
          <div class="avatar placeholder">
            <div class="bg-error text-error-content rounded-full w-12 h-12">
              <i class="fas fa-trash text-xl"></i>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-lg">Delete Event</h3>
            <p class="text-sm opacity-70">This action cannot be undone</p>
          </div>
        </div>

        <!-- Event Details Card -->
        <div class="bg-base-200 rounded-lg p-4 mb-6">
          <div class="flex items-center gap-3 mb-3">
            <div class="avatar placeholder">
              <div
                class="bg-primary text-primary-content rounded w-8 h-8 flex items-center justify-center"
              >
                <img
                  v-if="eventToDelete.gameIcon"
                  :src="eventToDelete.gameIcon"
                  :alt="eventToDelete.gameName"
                  class="w-6 h-6 rounded object-cover"
                  @error="(e) => (e.target as HTMLImageElement).style.display='none'"
                />
                <img
                  v-else-if="eventToDelete.gameLogo"
                  :src="eventToDelete.gameLogo"
                  :alt="eventToDelete.gameName"
                  class="w-6 h-6 rounded object-cover"
                  @error="(e) => (e.target as HTMLImageElement).style.display='none'"
                />
                <img
                  v-else-if="eventToDelete.gameImageCard"
                  :src="eventToDelete.gameImageCard"
                  :alt="eventToDelete.gameName"
                  class="w-6 h-6 rounded object-cover"
                  @error="(e) => (e.target as HTMLImageElement).style.display='none'"
                />
                <span v-else class="text-xs">🎮</span>
              </div>
            </div>
            <div>
              <div class="font-medium">{{ eventToDelete.gameName }}</div>
              <div class="text-xs opacity-70">Gaming Event</div>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <i class="fas fa-clock text-primary"></i>
              <span>{{ formatDateTime(eventToDelete.startTime) }}</span>
            </div>
            <div
              class="badge badge-sm"
              :class="getStatusBadgeClass(eventToDelete)"
            >
              {{ getDisplayStatus(eventToDelete) }}
            </div>
          </div>
        </div>

        <!-- Warning Message -->
        <div class="alert alert-warning mb-4">
          <i class="fas fa-exclamation-triangle"></i>
          <span class="text-sm"
            >Are you sure you want to permanently delete this event?</span
          >
        </div>

        <!-- Modal Actions -->
        <div class="modal-action gap-2">
          <button @click="eventToDelete = null" class="btn btn-ghost">
            <i class="fas fa-times mr-1"></i>
            Cancel
          </button>
          <button @click="deleteEvent" class="btn btn-error">
            <i class="fas fa-trash mr-1"></i>
            Delete Event
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  useEventsStore,
  type GameEvent,
  computeEventStatus,
} from "@/stores/events";

const emit = defineEmits<{
  create: [];
  edit: [event: GameEvent];
  import: [];
}>();

const eventsStore = useEventsStore();

const statusFilter = ref("");
const gameFilter = ref("");
const eventToDelete = ref<GameEvent | null>(null);

const isLoading = computed(() => eventsStore.isLoading);
const error = computed(() => eventsStore.error);
const events = computed(() => eventsStore.events);

const uniqueGames = computed(() => {
  const gameMap = new Map();
  events.value.forEach((event) => {
    if (!gameMap.has(event.gameId)) {
      gameMap.set(event.gameId, {
        gameId: event.gameId,
        gameName: event.gameName,
      });
    }
  });
  return Array.from(gameMap.values());
});

const filteredEvents = computed(() => {
  let filtered = events.value;

  if (statusFilter.value) {
    filtered = filtered.filter((event) => {
      const computedStatus = computeEventStatus(
        event.startTime,
        event.endTime,
        event.status
      );
      return computedStatus === statusFilter.value;
    });
  }

  if (gameFilter.value) {
    filtered = filtered.filter(
      (event) => event.gameId === parseInt(gameFilter.value)
    );
  }

  return filtered.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
});

function formatDateTime(isoString: string | Date): string {
  const date = typeof isoString === "string" ? new Date(isoString) : isoString;
  return date.toLocaleString();
}

function getStatusBadgeClass(event: GameEvent): string {
  const computedStatus = computeEventStatus(
    event.startTime,
    event.endTime,
    event.status
  );
  const classes = {
    upcoming: "badge-info",
    active: "badge-success",
    completed: "badge-neutral",
    cancelled: "badge-error",
  };
  return classes[computedStatus] || "badge-ghost";
}

function getDisplayStatus(event: GameEvent): string {
  return computeEventStatus(event.startTime, event.endTime, event.status);
}

async function updateStatus(eventId: number, status: "active" | "cancelled") {
  try {
    await eventsStore.updateEventStatus(eventId, status);
  } catch (error) {
    console.error("Failed to update event status:", error);
  }
}

function confirmDelete(event: GameEvent) {
  eventToDelete.value = event;
}

async function deleteEvent() {
  if (eventToDelete.value?.id) {
    try {
      await eventsStore.deleteEvent(eventToDelete.value.id);
      eventToDelete.value = null;
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  }
}

function clearFilters() {
  statusFilter.value = "";
  gameFilter.value = "";
}

function calculateDuration(
  startTime: string | Date,
  endTime: string | Date
): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
}

onMounted(() => {
  eventsStore.fetchEvents();
});
</script>
