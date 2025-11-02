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
          <!-- Users Link -->
          <li>
            <router-link
              :to="{ name: 'users' }"
              class="btn btn-ghost gap-2 hover:bg-info/10 hover:text-info transition-all duration-200"
              active-class="bg-info/20 text-info"
            >
              <i class="fas fa-users"></i>
              <span class="hidden sm:inline">Users</span>
            </router-link>
          </li>

          <!-- Events Link -->
          <li>
            <router-link
              :to="{ name: 'events' }"
              class="btn btn-ghost gap-2 hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
              active-class="bg-secondary/20 text-secondary"
            >
              <i class="fas fa-calendar-alt"></i>
              <span class="hidden sm:inline">Events</span>
            </router-link>
          </li>

          <!-- Create Game Dropdown -->
          <li>
            <details class="dropdown dropdown-end">
              <summary
                class="btn btn-ghost gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <i class="fas fa-plus"></i>
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
                      <i class="fas fa-search text-info"></i>
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
                      <i class="fab fa-steam text-accent"></i>
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
                      <i class="fas fa-plus text-success"></i>
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
            <i
              v-if="notificationStore.drawNotifications.type === 'success'"
              class="fas fa-check-circle text-success"
            ></i>
            <i
              v-else-if="notificationStore.drawNotifications.type === 'error'"
              class="fas fa-times-circle text-error"
            ></i>
            <i
              v-else-if="notificationStore.drawNotifications.type === 'warning'"
              class="fas fa-exclamation-triangle text-warning"
            ></i>
            <i v-else class="fas fa-info-circle text-info"></i>
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
