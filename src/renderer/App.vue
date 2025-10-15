<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useNotificationStore } from "@/stores/notification";
import logo from "@/assets/logo.svg";
import logoWhite from "@/assets/logo-white.svg";
import { ref } from "vue";

const notificationStore = useNotificationStore();

const isHovered = ref(false);

// Function to get notification border colors
function getNotificationBorderColor(type: string): string {
  const colors = {
    success: "var(--color-success)",
    error: "var(--color-error)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
  };
  return colors[type as keyof typeof colors] || "var(--color-base-300)";
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-gradient-to-br from-base-100 to-base-200"
  >
    <!-- Enhanced Navbar -->
    <nav
      class="navbar sticky top-0 z-50 bg-base-100/95 backdrop-blur-md border-b border-base-300/20 shadow-lg"
    >
      <div class="flex-1">
        <RouterLink
          :to="{ name: 'home' }"
          class="btn btn-ghost text-xl hover:bg-primary/10 transition-all duration-300"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        >
          <img
            :src="isHovered ? logo : logoWhite"
            alt="Lan Nexus Logo"
            class="h-16"
          />
        </RouterLink>
      </div>

      <div class="flex-none">
        <ul class="menu menu-horizontal px-1 gap-2">
          <!-- Events Link -->
          <li>
            <router-link
              :to="{ name: 'events' }"
              class="btn btn-ghost gap-2 hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
              active-class="bg-secondary/20 text-secondary"
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
                  d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a1 1 0 01-1 1h-1v10a2 2 0 01-2 2H7a2 2 0 01-2-2V11H4a1 1 0 01-1-1V9a2 2 0 012-2h3z"
                />
              </svg>
              <span class="hidden sm:inline">Events</span>
            </router-link>
          </li>

          <!-- Create Game Dropdown -->
          <li>
            <details class="dropdown dropdown-end">
              <summary
                class="btn btn-ghost gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span class="hidden sm:inline">Create Game</span>
              </summary>
              <ul
                class="dropdown-content menu bg-base-100/95 backdrop-blur-sm border border-base-300/20 rounded-xl shadow-2xl w-56 p-2 mt-2 gap-1"
              >
                <li>
                  <router-link
                    :to="{ name: 'findGame' }"
                    class="flex items-center gap-3 p-3 hover:bg-info/10 hover:text-info rounded-lg transition-all duration-200"
                  >
                    <div class="p-1 bg-info/10 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-info"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="font-semibold">Find Game</div>
                      <div class="text-xs opacity-60">
                        Search existing games
                      </div>
                    </div>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ name: 'createGameSteam' }"
                    class="flex items-center gap-3 p-3 hover:bg-accent/10 hover:text-accent rounded-lg transition-all duration-200"
                  >
                    <div class="p-1 bg-accent/10 rounded-lg">
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
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="font-semibold">From Steam</div>
                      <div class="text-xs opacity-60">Import from Steam</div>
                    </div>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ name: 'createGame' }"
                    class="flex items-center gap-3 p-3 hover:bg-success/10 hover:text-success rounded-lg transition-all duration-200"
                  >
                    <div class="p-1 bg-success/10 rounded-lg">
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="font-semibold">Create New</div>
                      <div class="text-xs opacity-60">Create from scratch</div>
                    </div>
                  </router-link>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Enhanced Main Content -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Enhanced Notifications -->
    <template v-if="notificationStore.hasNotifications">
      <div class="toast toast-top toast-end z-50">
        <div
          :class="'alert-' + notificationStore.drawNotifications.type"
          class="alert shadow-xl border backdrop-blur-sm"
          :style="{
            borderColor: getNotificationBorderColor(
              notificationStore.drawNotifications.type
            ),
          }"
        >
          <div class="flex items-center gap-2">
            <svg
              v-if="notificationStore.drawNotifications.type === 'success'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 shrink-0"
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
              v-else-if="notificationStore.drawNotifications.type === 'error'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else-if="notificationStore.drawNotifications.type === 'warning'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 shrink-0"
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
            <span class="font-medium">{{
              notificationStore.drawNotifications.message
            }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Hidden toast colors for DaisyUI -->
    <div class="toast hidden">
      <div class="alert-success alert-info alert-error alert-warning">
        <span></span>
      </div>
    </div>
  </div>
</template>
