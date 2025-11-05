<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
        Lan Nexus
      </h1>
      <p class="text-xl text-base-content/70 max-w-2xl mx-auto">
        Welcome to Lan Nexus, your ultimate LAN party hub. Manage your game library, track sessions, and organize events all in one place.
      </p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <StatsCard 
        title="Games"
        :value="gameCount"
        description="In your library"
        icon="fas fa-gamepad"
        variant="primary"
      />

      <StatsCard 
        title="Active Players"
        :value="activePlayerCount"
        description="Currently playing"
        icon="fas fa-users"
        variant="secondary"
      />

      <StatsCard 
        title="Events"
        :value="upcomingEventCount"
        description="Coming up"
        icon="fas fa-calendar"
        variant="accent"
      />
    </div>

    <!-- Navigation Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NavigationCard 
        title="Game Library"
        description="Browse and manage your game collection"
        icon="fas fa-gamepad"
        to="/games"
        variant="primary"
      />

      <NavigationCard 
        title="Dashboard"
        description="View live stats and gaming activity"
        icon="fas fa-chart-line"
        to="/dashboard"
        variant="secondary"
      />

      <NavigationCard 
        title="Events"
        description="Schedule and manage gaming events"
        icon="fas fa-calendar-alt"
        to="/events"
        variant="accent"
      />

      <NavigationCard 
        title="Game Sessions"
        description="Track gaming time and activity"
        icon="fas fa-clock"
        to="/game-sessions"
        variant="warning"
      />

      <NavigationCard 
        title="Users"
        description="Manage players and permissions"
        icon="fas fa-users"
        to="/users"
        variant="info"
      />


    </div>


  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useGamesStore } from '@/stores/games';
import { useGameSessionsStore } from '@/stores/gameSessions';
import { useEventsStore, computeEventStatus } from '@/stores/events';
import StatsCard from '@/components/common/StatsCard.vue';
import NavigationCard from '@/components/common/NavigationCard.vue';

const gamesStore = useGamesStore();
const gameSessionsStore = useGameSessionsStore();
const eventsStore = useEventsStore();

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      gamesStore.getGames(),
      gameSessionsStore.fetchActiveSessions(),
      eventsStore.fetchEvents()
    ]);
  } catch (error) {
    console.error('Failed to load initial data:', error);
  }
});

// Computed properties
const gameCount = computed(() => gamesStore.games.length);

const activePlayerCount = computed(() => {
  const uniquePlayers = new Set(gameSessionsStore.activeSessions.map(s => s.clientId));
  return uniquePlayers.size;
});

const upcomingEventCount = computed(() => {
  return eventsStore.events.filter(event => {
    const computedStatus = computeEventStatus(event.startTime, event.endTime, event.status);
    return computedStatus === 'upcoming';
  }).length;
});
</script>

<style scoped>



/* Hover animations */
.card:hover:not(.no-hover) {
  transform: translateY(-4px);
}

/* Gradient text animation */
@keyframes gradient-x {
  0%, 100% {
    background-size: 200% 200%;
    background-position: left center;
  }
  50% {
    background-size: 200% 200%;
    background-position: right center;
  }
}

.bg-gradient-to-r {
  animation: gradient-x 3s ease infinite;
}

/* Fade in animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeInUp 0.6s ease-out;
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
.card:nth-child(4) { animation-delay: 0.4s; }
.card:nth-child(5) { animation-delay: 0.5s; }
.card:nth-child(6) { animation-delay: 0.6s; }
</style>