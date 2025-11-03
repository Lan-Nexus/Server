<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
    <!-- Create Event Modal -->
    <input
      type="checkbox"
      id="create-modal"
      class="modal-toggle"
      v-model="showCreateModal"
    />
    <div class="modal" role="dialog">
      <div
        class="modal-box max-w-2xl bg-base-100/95 backdrop-blur-sm border border-base-300/20"
      >
        <div
          class="flex justify-between items-center mb-6 pb-4 border-b border-base-300/20"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <i class="fas fa-plus text-primary text-lg"></i>
            </div>
            <h3
              class="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              Create New Event
            </h3>
          </div>
          <label
            for="create-modal"
            class="btn btn-sm btn-circle btn-ghost hover:btn-error transition-all duration-200"
          >
            ✕
          </label>
        </div>
        <EventForm
          :is-loading="eventsStore.isLoading"
          submit-text="Create Event"
          @submit="handleCreateEvent"
          @cancel="showCreateModal = false"
        />
      </div>
      <label class="modal-backdrop" for="create-modal">Close</label>
    </div>

    <!-- Edit Event Modal -->
    <input
      type="checkbox"
      id="edit-modal"
      class="modal-toggle"
      v-model="showEditModal"
    />
    <div class="modal" role="dialog">
      <div
        class="modal-box max-w-2xl bg-base-100/95 backdrop-blur-sm border border-base-300/20"
      >
        <div
          class="flex justify-between items-center mb-6 pb-4 border-b border-base-300/20"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-secondary/10 rounded-lg">
              <i class="fas fa-edit text-secondary text-lg"></i>
            </div>
            <h3
              class="text-xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent"
            >
              Edit Event
            </h3>
          </div>
          <label
            for="edit-modal"
            class="btn btn-sm btn-circle btn-ghost hover:btn-error transition-all duration-200"
          >
            ✕
          </label>
        </div>
        <EventForm
          v-if="editingEvent"
          :event="editingEvent"
          :is-loading="eventsStore.isLoading"
          submit-text="Update Event"
          @submit="handleUpdateEvent"
          @cancel="closeEditModal"
        />
      </div>
      <label class="modal-backdrop" for="edit-modal">Close</label>
    </div>

    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="toast toast-top toast-end z-50">
      <div class="alert alert-success shadow-xl border border-success/20">
        <i class="fas fa-check-circle"></i>
        <span class="font-medium">{{ successMessage }}</span>
      </div>
    </div>

    <!-- Error Toast -->
    <div v-if="showErrorToast" class="toast toast-top toast-end z-50">
      <div class="alert alert-error shadow-xl border border-error/20">
        <i class="fas fa-exclamation-circle"></i>
        <span class="font-medium">{{ errorMessage }}</span>
      </div>
    </div>

    <!-- Calendar Import Modal -->
    <input
      type="checkbox"
      id="import-modal"
      class="modal-toggle"
      v-model="showImportModal"
    />
    <div class="modal" role="dialog">
      <div
        class="modal-box max-w-4xl bg-base-100/95 backdrop-blur-sm border border-base-300/20"
      >
        <div
          class="flex justify-between items-center mb-6 pb-4 border-b border-base-300/20"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-accent/10 rounded-lg">
              <i class="fas fa-file-import text-accent text-lg"></i>
            </div>
            <h3
              class="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent"
            >
              Import Calendar Events
            </h3>
          </div>
          <label
            for="import-modal"
            class="btn btn-sm btn-circle btn-ghost hover:btn-error transition-all duration-200"
          >
            ✕
          </label>
        </div>
        <CalendarImporter
          ref="calendarImporterRef"
          @events-imported="handleEventsImported"
          @close="handleImportModalClose"
        />
      </div>
      <label class="modal-backdrop" for="import-modal">Close</label>
    </div>

    <!-- Main Content -->
    <EventsList
      @create="showCreateModal = true"
      @edit="handleEditEvent"
      @import="showImportModal = true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  useEventsStore,
  type CreateEventType,
  type GameEvent,
} from "@/stores/events";
import EventForm from "@/components/EventForm.vue";
import EventsList from "@/components/EventsList.vue";
import CalendarImporter from "@/components/CalendarImporter.vue";

const eventsStore = useEventsStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showImportModal = ref(false);
const editingEvent = ref<GameEvent | null>(null);
const calendarImporterRef = ref();

const showSuccessToast = ref(false);
const showErrorToast = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

function showToast(message: string, isError = false) {
  if (isError) {
    errorMessage.value = message;
    showErrorToast.value = true;
    setTimeout(() => {
      showErrorToast.value = false;
    }, 3000);
  } else {
    successMessage.value = message;
    showSuccessToast.value = true;
    setTimeout(() => {
      showSuccessToast.value = false;
    }, 3000);
  }
}

async function handleCreateEvent(eventData: CreateEventType) {
  try {
    await eventsStore.createEvent(eventData);
    showCreateModal.value = false;
    showToast("Event created successfully!");
  } catch (error: any) {
    showToast(error.message || "Failed to create event", true);
  }
}

function handleEditEvent(event: GameEvent) {
  editingEvent.value = event;
  showEditModal.value = true;
}

async function handleUpdateEvent(eventData: CreateEventType) {
  if (!editingEvent.value?.id) return;

  try {
    await eventsStore.updateEvent(editingEvent.value.id, eventData);
    closeEditModal();
    showToast("Event updated successfully!");
  } catch (error: any) {
    showToast(error.message || "Failed to update event", true);
  }
}

function closeEditModal() {
  showEditModal.value = false;
  editingEvent.value = null;
}

function handleEventsImported(count: number) {
  showImportModal.value = false;
  showToast(`Successfully imported ${count} events!`);
}

function handleImportModalClose() {
  showImportModal.value = false;
  // Clear the calendar importer data when modal closes
  if (calendarImporterRef.value) {
    calendarImporterRef.value.clearAllData();
  }
}

// Watch for modal close and clear data
watch(showImportModal, (newValue, oldValue) => {
  // When modal closes (goes from true to false), clear the data
  if (oldValue === true && newValue === false) {
    if (calendarImporterRef.value) {
      calendarImporterRef.value.clearAllData();
    }
  }
});
</script>
