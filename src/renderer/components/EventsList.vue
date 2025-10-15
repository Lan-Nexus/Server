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
        <button
          @click="$emit('create')"
          class="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New Event
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div
      class="card bg-base-100/50 backdrop-blur-sm border border-base-300/20 shadow-xl"
    >
      <div class="card-body">
        <h3 class="card-title text-xl mb-4">
          <div class="p-2 bg-info/10 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-info"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
              />
            </svg>
          </div>
          Filters & Search
        </h3>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-secondary"
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-24 w-24 text-base-content/30 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a1 1 0 01-1 1h-1v10a2 2 0 01-2 2H7a2 2 0 01-2-2V11H4a1 1 0 01-1-1V9a2 2 0 012-2h3z"
            />
          </svg>
          <h3 class="text-2xl font-bold mb-2">No Events Found</h3>
          <p class="text-base-content/60 mb-6">
            {{
              statusFilter || gameFilter
                ? "Try adjusting your filters or create a new event."
                : "Get started by creating your first gaming event!"
            }}
          </p>
          <button @click="$emit('create')" class="btn btn-primary btn-lg gap-2">
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Your First Event
          </button>
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
                  <svg
                    v-if="getDisplayStatus(event) === 'active'"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.07 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
                    />
                  </svg>
                  <svg
                    v-else-if="getDisplayStatus(event) === 'upcoming'"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
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
                  <svg
                    v-else-if="getDisplayStatus(event) === 'completed'"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
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
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
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
                v-else
                @click="updateStatus(event.id!, 'active')"
                class="btn btn-success btn-sm gap-2 flex-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
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
                Activate
              </button>
            </div>

            <!-- Edit Button -->
            <div class="tooltip" data-tip="Edit Event">
              <button
                @click="$emit('edit', event)"
                class="btn btn-primary btn-sm gap-2 flex-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
            </div>

            <!-- Delete Button -->
            <div class="tooltip" data-tip="Delete Event">
              <button
                @click="confirmDelete(event)"
                class="btn btn-error btn-sm gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span class="text-sm"
            >Are you sure you want to permanently delete this event?</span
          >
        </div>

        <!-- Modal Actions -->
        <div class="modal-action gap-2">
          <button @click="eventToDelete = null" class="btn btn-ghost">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>
          <button @click="deleteEvent" class="btn btn-error">
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
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
