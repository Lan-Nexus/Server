<template>
  <div
    class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
  >
    <div class="card-body">
      <!-- Import View -->
      <div v-if="!showEventsReview">
        <!-- Import Methods -->
        <div class="tabs tabs-boxed mb-6">
          <a
            class="tab"
            :class="{ 'tab-active': importMethod === 'file' }"
            @click="importMethod = 'file'"
          >
            <i class="fas fa-file-upload"></i> File Upload
          </a>
          <a
            class="tab"
            :class="{ 'tab-active': importMethod === 'text' }"
            @click="importMethod = 'text'"
          >
            <i class="fas fa-paste"></i> Paste Content
          </a>
          <a
            class="tab"
            :class="{ 'tab-active': importMethod === 'url' }"
            @click="importMethod = 'url'"
          >
            <i class="fas fa-globe"></i> URL Import
          </a>
        </div>

        <!-- File Upload Method -->
        <div v-if="importMethod === 'file'" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold"
                >Select Calendar File (.ics)</span
              >
            </label>
            <FileUpload
              v-model="selectedFile"
              accept=".ics,.ical,.ifb,.icalendar"
              @update:model-value="handleFileSelection"
            />
            <div class="label">
              <span class="label-text-alt text-base-content/60">
                Supported formats: .ics, .ical, .ifb, .icalendar
                <br />
                <a
                  href="/sample-gaming-events.ics"
                  download
                  class="link link-primary text-xs"
                >
                  📥 Download sample calendar file
                </a>
                <span class="mx-2">•</span>
                <a
                  href="/test-timezone-calendar.ics"
                  download
                  class="link link-accent text-xs"
                >
                  📥 Download timezone test file
                </a>
              </span>
            </div>
          </div>
        </div>

        <!-- Text Paste Method -->
        <div v-if="importMethod === 'text'" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold"
                >Paste Calendar Content</span
              >
            </label>
            <textarea
              v-model="calendarText"
              class="textarea textarea-bordered h-32 bg-base-100/80 focus:bg-base-100 transition-all duration-200"
              placeholder="Paste your .ics calendar content here..."
              :disabled="isProcessing"
            ></textarea>
            <div class="label">
              <span class="label-text-alt text-base-content/60">
                Paste the raw content of your .ics file
              </span>
            </div>
          </div>
          <button
            @click="parseCalendarText"
            class="btn btn-primary gap-2"
            :disabled="!calendarText.trim() || isProcessing"
          >
            <i class="fas fa-cogs"></i>
            Parse Calendar
          </button>
        </div>

        <!-- URL Import Method -->
        <div v-if="importMethod === 'url'" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Calendar URL</span>
            </label>
            <input
              type="url"
              v-model="calendarUrl"
              class="input input-bordered w-full bg-base-100/80 focus:bg-base-100 transition-all duration-200"
              placeholder="https://example.com/calendar.ics"
              :disabled="isProcessing"
            />
            <div class="label">
              <span class="label-text-alt text-base-content/60">
                URL to a publicly accessible .ics calendar file
              </span>
            </div>
          </div>
          <button
            @click="fetchCalendarFromUrl"
            class="btn btn-primary gap-2"
            :disabled="!calendarUrl.trim() || isProcessing"
          >
            <i class="fas fa-download"></i>
            Fetch Calendar
          </button>
        </div>

        <!-- Processing Indicator -->
        <div v-if="isProcessing" class="flex items-center justify-center py-8">
          <div class="text-center">
            <span
              class="loading loading-spinner loading-lg text-primary mb-4"
            ></span>
            <h3 class="text-lg font-semibold mb-2">Processing Calendar</h3>
            <p class="text-base-content/60">{{ processingMessage }}</p>
          </div>
        </div>

        <!-- Parsed Events Summary -->
        <div v-if="parsedEvents.length > 0 && !isProcessing" class="mt-8">
          <div class="alert alert-success">
            <i class="fas fa-check-circle"></i>
            <div>
              <h3 class="font-bold">Calendar Parsed Successfully!</h3>
              <div class="text-sm">
                Found {{ parsedEvents.length }} events. Click below to review
                and import them.
              </div>
            </div>
          </div>

          <div class="flex justify-center mt-4">
            <button
              @click="showEventsReview = true"
              class="btn btn-primary btn-lg gap-2"
            >
              <i class="fas fa-calendar-check"></i>
              Review {{ parsedEvents.length }} Events
            </button>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="alert alert-error mt-6">
          <i class="fas fa-exclamation-circle"></i>
          <div>
            <h3 class="font-bold">Import Error</h3>
            <div class="text-sm">{{ error }}</div>
          </div>
        </div>
      </div>

      <!-- Events Review View -->
      <div v-else class="space-y-6">
        <!-- Header with Back Button -->
        <div class="flex items-center justify-between">
          <button @click="showEventsReview = false" class="btn btn-ghost gap-2">
            <i class="fas fa-arrow-left"></i>
            Back to Import
          </button>
          <div class="flex items-center gap-3">
            <div class="p-3 bg-primary/10 rounded-xl">
              <i class="fas fa-calendar-check text-primary text-xl"></i>
            </div>
            <div class="text-center">
              <h3
                class="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              >
                Review Calendar Events
              </h3>
              <p class="text-base-content/70">
                Found {{ parsedEvents.length }} events ready for import
              </p>
            </div>
          </div>
          <div class="w-24"></div>
          <!-- Spacer for balance -->
        </div>

        <!-- Game Assignment Alert -->
        <div class="alert alert-info">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4 class="font-bold">Game Assignment Required</h4>
            <p class="text-sm">
              Calendar events need to be associated with games. Select a default
              game below or assign games individually.
            </p>
          </div>
        </div>

        <!-- Default Game Selection -->
        <div class="card bg-base-200/50 border border-base-300/20">
          <div class="card-body p-4">
            <div class="flex items-center gap-3 mb-4">
              <i class="fas fa-gamepad text-primary text-lg"></i>
              <h4 class="font-semibold text-lg">Default Game Assignment</h4>
            </div>
            <div class="flex gap-3">
              <select
                v-model.number="defaultGameId"
                class="select select-bordered flex-1 bg-base-100/80"
              >
                <option value="">Select a default game for all events</option>
                <option v-for="game in games" :key="game.id" :value="game.id">
                  {{ game.name }}
                </option>
              </select>
              <button
                @click="applyDefaultGame"
                class="btn btn-primary gap-2"
                :disabled="!defaultGameId"
              >
                <i class="fas fa-magic"></i>
                Apply to All
              </button>
            </div>
          </div>
        </div>

        <!-- Events Grid -->
        <div class="space-y-0 max-h-[50vh] overflow-y-auto pr-2">
          <template v-for="(event, index) in parsedEvents" :key="index">
            <div
              class="card bg-gradient-to-r from-base-100 to-base-200/50 border border-base-300/20 hover:shadow-lg transition-all duration-200"
            >
              <div class="card-body p-6">
                <!-- Event Header -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 rounded-full bg-primary"></div>
                    <h4 class="font-bold text-xl">{{ event.title }}</h4>
                  </div>
                  <!-- Game Assignment Status -->
                  <div v-if="event.gameId" class="badge badge-success gap-2">
                    <i class="fas fa-check-circle"></i>
                    Game Assigned
                  </div>
                  <div v-else class="badge badge-warning gap-2">
                    <i class="fas fa-exclamation-triangle"></i>
                    Needs Game
                  </div>
                </div>

                <!-- Event Times -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-success/10 rounded-lg">
                      <i class="fas fa-play text-success"></i>
                    </div>
                    <div>
                      <div
                        class="text-xs text-base-content/60 uppercase tracking-wide"
                      >
                        Start Time
                      </div>
                      <div class="font-semibold">
                        {{ formatDateTime(event.startTime) }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-error/10 rounded-lg">
                      <i class="fas fa-stop text-error"></i>
                    </div>
                    <div>
                      <div
                        class="text-xs text-base-content/60 uppercase tracking-wide"
                      >
                        End Time
                      </div>
                      <div class="font-semibold">
                        {{ formatDateTime(event.endTime) }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Event Description -->
                <div
                  v-if="event.description && event.description !== event.title"
                  class="mb-6 p-4 bg-base-100/60 rounded-lg border border-base-300/20"
                >
                  <div
                    class="text-xs text-base-content/60 uppercase tracking-wide mb-2"
                  >
                    Description
                  </div>
                  <div class="text-sm text-base-content/80">
                    <i class="fas fa-quote-left text-xs opacity-50 mr-2"></i>
                    {{ event.description }}
                  </div>
                </div>

                <!-- Actions Section -->
                <div class="border-t border-base-300/20 pt-4">
                  <div class="flex flex-col sm:flex-row gap-4">
                    <!-- Game Assignment -->
                    <div class="flex-1">
                      <label
                        class="text-xs text-base-content/60 uppercase tracking-wide mb-2 block"
                      >
                        <i class="fas fa-gamepad mr-2"></i>Assign Game
                      </label>
                      <select
                        v-model.number="event.gameId"
                        class="select select-bordered w-full bg-base-100/80"
                        :class="{
                          'border-warning': !event.gameId,
                          'border-success': event.gameId,
                        }"
                      >
                        <option value="">Choose a game...</option>
                        <option
                          v-for="game in games"
                          :key="game.id"
                          :value="game.id"
                        >
                          {{ game.name }}
                        </option>
                      </select>
                      <!-- Show selected game name -->
                      <div
                        v-if="event.gameId"
                        class="mt-2 text-xs text-success"
                      >
                        <i class="fas fa-check mr-1"></i>
                        Selected:
                        {{ games.find((g) => g.id === event.gameId)?.name }}
                      </div>
                    </div>

                    <!-- Remove Action -->
                    <div class="flex-shrink-0 sm:w-32">
                      <label
                        class="text-xs text-base-content/60 uppercase tracking-wide mb-2 block"
                      >
                        Action
                      </label>
                      <button
                        @click="removeEvent(index)"
                        class="btn btn-error w-full gap-2"
                      >
                        <i class="fas fa-trash"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Separator between events (except after last event) -->
            <div
              v-if="index < parsedEvents.length - 1"
              class="flex items-center justify-center py-6 mx-4"
            >
              <div
                class="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              ></div>
              <div
                class="px-6 py-2 bg-primary/10 rounded-full border border-primary/20"
              >
                <span
                  class="text-xs font-semibold text-primary uppercase tracking-widest"
                >
                  <i class="fas fa-calendar-alt mr-2"></i>Event {{ index + 2 }}
                </span>
              </div>
              <div
                class="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              ></div>
            </div>
          </template>
        </div>
        <!-- Review Actions -->
        <div
          class="flex items-center justify-between pt-4 border-t border-base-300/20"
        >
          <div class="flex items-center gap-4">
            <div class="stats stats-horizontal bg-base-200/50">
              <div class="stat py-2 px-4">
                <div class="stat-title text-xs">Total Events</div>
                <div class="stat-value text-lg">{{ parsedEvents.length }}</div>
              </div>
              <div class="stat py-2 px-4">
                <div class="stat-title text-xs">Ready to Import</div>
                <div class="stat-value text-lg text-success">
                  {{ validEventsCount }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button @click="clearParsedEvents" class="btn btn-outline gap-2">
              <i class="fas fa-times"></i>
              Clear All
            </button>
            <button
              @click="importEvents"
              class="btn btn-success gap-2 min-w-32"
              :disabled="!canImport || isImporting"
            >
              <span
                v-if="isImporting"
                class="loading loading-spinner loading-sm"
              ></span>
              <i v-else class="fas fa-download"></i>
              Import {{ validEventsCount }} Events
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useGamesStore, type getGameType } from "@/stores/games";
import { useEventsStore, type CreateEventType } from "@/stores/events";
import FileUpload from "@/components/gameForm/FileUpload.vue";
import ICAL from "ical.js";

interface ParsedEvent {
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  gameId?: number;
  gameName?: string;
}

const emit = defineEmits<{
  eventsImported: [count: number];
}>();

const gamesStore = useGamesStore();
const eventsStore = useEventsStore();

const importMethod = ref<"file" | "text" | "url">("file");
const calendarText = ref("");
const calendarUrl = ref("");
const defaultGameId = ref<number | "">("");
const selectedFile = ref<File | null>(null);
const showEventsReview = ref(false);

const isProcessing = ref(false);
const isImporting = ref(false);
const processingMessage = ref("");
const error = ref("");

const parsedEvents = ref<ParsedEvent[]>([]);
const games = ref<getGameType[]>([]);

const validEventsCount = computed(() => {
  return parsedEvents.value.filter((event) => event.gameId).length;
});

const canImport = computed(() => {
  return validEventsCount.value > 0 && !isImporting.value;
});

function handleFileSelection(file: File | null | undefined) {
  if (!file) return;

  if (!file.name.match(/\.(ics|ical|ifb|icalendar)$/i)) {
    error.value =
      "Please select a valid calendar file (.ics, .ical, .ifb, .icalendar)";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    parseCalendar(content);
  };
  reader.readAsText(file);
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!file.name.match(/\.(ics|ical|ifb|icalendar)$/i)) {
    error.value =
      "Please select a valid calendar file (.ics, .ical, .ifb, .icalendar)";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    parseCalendar(content);
  };
  reader.readAsText(file);
}

function parseCalendarText() {
  if (!calendarText.value.trim()) {
    error.value = "Please paste calendar content";
    return;
  }
  parseCalendar(calendarText.value);
}

async function fetchCalendarFromUrl() {
  if (!calendarUrl.value.trim()) {
    error.value = "Please enter a calendar URL";
    return;
  }

  isProcessing.value = true;
  processingMessage.value = "Fetching calendar from URL...";
  error.value = "";

  try {
    console.log("Fetching calendar from URL via server:", calendarUrl.value);

    // Use our server endpoint to fetch the calendar
    const response = await fetch("/api/calendar/fetch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Add auth token
      },
      body: JSON.stringify({
        url: calendarUrl.value,
      }),
    });

    console.log("Server response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Server error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("Calendar fetch result:", result.metadata);

    if (!result.success || !result.data) {
      throw new Error("Invalid response from server");
    }

    console.log("Calendar content length:", result.data.length);

    parseCalendar(result.data);
  } catch (err: any) {
    console.error("Calendar fetch error:", err);

    if (err.message.includes("403") || err.message.includes("Forbidden")) {
      error.value = `Permission denied: You don't have permission to fetch calendar URLs. Please contact an administrator.`;
    } else if (
      err.message.includes("401") ||
      err.message.includes("Unauthorized")
    ) {
      error.value = `Authentication required: Please log in again to fetch calendar URLs.`;
    } else if (err.message.includes("429")) {
      error.value = `Rate limit exceeded: Too many requests. Please wait a moment and try again.`;
    } else if (err.name === "TypeError" && err.message.includes("fetch")) {
      error.value = `Network error: Unable to connect to the server. Please check your connection.`;
    } else {
      error.value = err.message || "Failed to fetch calendar from URL";
    }
  } finally {
    isProcessing.value = false;
  }
}

function parseCalendar(content: string) {
  isProcessing.value = true;
  processingMessage.value = "Parsing calendar events...";
  error.value = "";
  parsedEvents.value = [];

  try {
    // Basic ICS parser
    const events = parseICSContent(content);
    parsedEvents.value = events;

    if (events.length === 0) {
      error.value = "No events found in the calendar file";
    }
  } catch (err: any) {
    error.value = err.message || "Failed to parse calendar content";
  } finally {
    isProcessing.value = false;
  }
}

function parseICSContent(content: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];

  try {
    // Parse the calendar with ical.js
    const jcalData = ICAL.parse(content);
    const comp = new ICAL.Component(jcalData);

    // Get all VEVENT components
    const vevents = comp.getAllSubcomponents("vevent");

    for (const vevent of vevents) {
      const event = new ICAL.Event(vevent);

      // Extract event data
      const summary = event.summary || "Untitled Event";
      const description = event.description || "";

      // Handle start and end times
      let startTime: string;
      let endTime: string;

      if (event.startDate) {
        startTime = event.startDate.toJSDate().toISOString();
      } else {
        console.warn("Event missing start date:", summary);
        continue;
      }

      if (event.endDate) {
        endTime = event.endDate.toJSDate().toISOString();
      } else if (event.startDate) {
        // If no end date, default to 1 hour duration
        const endDate = event.startDate.toJSDate();
        endDate.setHours(endDate.getHours() + 1);
        endTime = endDate.toISOString();
      } else {
        console.warn("Event missing end date:", summary);
        continue;
      }

      // Validate that end time is after start time
      if (new Date(endTime) <= new Date(startTime)) {
        const startDate = new Date(startTime);
        startDate.setHours(startDate.getHours() + 1);
        endTime = startDate.toISOString();
      }

      events.push({
        title: summary,
        startTime,
        endTime,
        description: description || summary,
      });
    }
  } catch (error) {
    console.error("Error parsing calendar with ical.js:", error);
    throw new Error(
      "Failed to parse calendar file. Please ensure it's a valid iCalendar (.ics) file."
    );
  }

  return events;
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString();
}

function applyDefaultGame() {
  if (!defaultGameId.value) return;

  const selectedGame = games.value.find(
    (game) => game.id === defaultGameId.value
  );
  if (!selectedGame) return;

  parsedEvents.value.forEach((event) => {
    if (!event.gameId) {
      event.gameId = selectedGame.id;
      event.gameName = selectedGame.name;
    }
  });
}

function removeEvent(index: number) {
  parsedEvents.value.splice(index, 1);
}

function clearParsedEvents() {
  parsedEvents.value = [];
  calendarText.value = "";
  calendarUrl.value = "";
  error.value = "";
  showEventsReview.value = false;
}

async function importEvents() {
  if (!canImport.value) return;

  isImporting.value = true;
  let importedCount = 0;
  let failedCount = 0;

  try {
    const validEvents = parsedEvents.value.filter((event) => event.gameId);

    for (const event of validEvents) {
      try {
        const selectedGame = games.value.find(
          (game) => game.id === event.gameId
        );
        const eventData: CreateEventType = {
          gameId: event.gameId!,
          gameName: selectedGame?.name || "Unknown Game",
          startTime: event.startTime,
          endTime: event.endTime,
          status: "active",
          description: event.description || event.title,
        };

        await eventsStore.createEvent(eventData);
        importedCount++;
      } catch (err) {
        console.error("Failed to import event:", event.title, err);
        failedCount++;
      }
    }

    if (importedCount > 0) {
      emit("eventsImported", importedCount);
      clearParsedEvents();
    }

    if (failedCount > 0) {
      error.value = `Imported ${importedCount} events successfully, ${failedCount} failed`;
    }
  } catch (err: any) {
    error.value = err.message || "Failed to import events";
  } finally {
    isImporting.value = false;
  }
}

onMounted(async () => {
  await gamesStore.getGames();
  games.value = gamesStore.games;
});
</script>
