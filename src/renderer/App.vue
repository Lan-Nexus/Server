<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useNotificationStore } from "@/stores/notification";
import { useAuthStore } from "@/stores/auth";
import UserAvatar from "@/components/common/UserAvatar.vue";
import logo from "@/assets/logo.svg";
import logoWhite from "@/assets/logo-white.svg";
import { ref, onMounted, onUnmounted } from "vue";
import { useFullscreenStore } from "@/stores/fullscreen";

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const fullscreenStore = useFullscreenStore();

const isHovered = ref(false);

// Initialize fullscreen listeners immediately and on mount
fullscreenStore.initializeListeners();

onMounted(() => {
  // Double-check listeners are set up
  fullscreenStore.initializeListeners();
  console.log('App mounted, fullscreen listeners initialized');
});

onUnmounted(() => {
  fullscreenStore.removeListeners();
});

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
      v-show="!fullscreenStore.isFullscreen"
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
          <!-- Dashboard Link -->
          <li>
            <router-link
              :to="{ name: 'dashboard' }"
              class="btn btn-ghost gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200"
              active-class="bg-accent/20 text-accent"
            >
              <i class="fas fa-tv"></i>
              <span class="hidden sm:inline">Dashboard</span>
            </router-link>
          </li>

          <!-- Games Link -->
          <li>
            <router-link
              :to="{ name: 'games' }"
              class="btn btn-ghost gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
              active-class="bg-primary/20 text-primary"
            >
              <i class="fas fa-gamepad"></i>
              <span class="hidden sm:inline">Games</span>
            </router-link>
          </li>

          <!-- Game Sessions Link -->
          <li>
            <router-link
              :to="{ name: 'gameSessions' }"
              class="btn btn-ghost gap-2 hover:bg-warning/10 hover:text-warning transition-all duration-200"
              active-class="bg-warning/20 text-warning"
            >
              <i class="fas fa-clock"></i>
              <span class="hidden sm:inline">Sessions</span>
            </router-link>
          </li>

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


        </ul>
      </div>

      <!-- Fullscreen Button -->
      <div class="flex-none mr-2">
        <button 
          @click="fullscreenStore.toggleFullscreen"
          class="btn btn-ghost btn-circle text-lg hover:bg-primary/10 hover:text-primary transition-all duration-200"
          :title="fullscreenStore.isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'"
        >
          <i class="fas" :class="fullscreenStore.isFullscreen ? 'fa-compress' : 'fa-expand'"></i>
        </button>
      </div>

      <!-- User Info & Logout -->
      <div class="flex-none">
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <div class="w-10 h-10 rounded-full overflow-hidden">
              <UserAvatar
                :name="authStore.user?.name || 'User'"
                size="md"
                :hover="false"
                :avatar="authStore.user?.avatar || undefined"
              />
            </div>
          </div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100/95 backdrop-blur-sm border border-base-300/20 rounded-xl shadow-2xl w-64 p-2 mt-2">
            <li class="menu-title px-4 py-2">
              <span class="text-base-content/60">Signed in as</span>
            </li>
            <li class="px-4 py-3 border-b border-base-300/20 mb-2">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full overflow-hidden">
                  <UserAvatar
                    :name="authStore.user?.name || 'User'"
                    size="lg"
                    :hover="false"
                    :avatar="authStore.user?.avatar || undefined"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <span class="font-semibold">{{ authStore.user?.name }}</span>
                  <span class="text-xs text-base-content/60 font-mono">{{ authStore.user?.clientId }}</span>
                  <span class="badge badge-xs" :class="{
                    'badge-primary': authStore.user?.role === 'admin',
                    'badge-secondary': authStore.user?.role === 'user',
                    'badge-neutral': authStore.user?.role === 'guest'
                  }">{{ authStore.user?.role }}</span>
                </div>
              </div>
            </li>
            <li>
              <button @click="authStore.logout" class="flex items-center gap-3 hover:bg-error/10 hover:text-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </div>
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
