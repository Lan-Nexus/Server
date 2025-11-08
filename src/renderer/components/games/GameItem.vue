<script setup lang="ts">
import { useGamesStore, type getGameType } from "@/stores/games";
import ConfirmPopup from "@/components/ConfirmPopup.vue";
import { ref } from "vue";
import router from "@/router";
import ActionButtons from "./ActionButtons.vue";

const { game } = defineProps<{ game: getGameType }>();

const gamesStore = useGamesStore();
</script>

<template>
  <tr class="hover:bg-base-200/20 transition-all duration-200 group">
    <!-- Game Icon -->
    <td class="py-4">
      <div class="avatar">
        <div
          class="w-12 h-12 rounded-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-200"
        >
          <img
            :src="game.icon"
            :alt="`${game.name} icon`"
            class="object-cover rounded-lg"
            loading="lazy"
          />
        </div>
      </div>
    </td>

    <!-- Game Name -->
    <td class="py-4">
      <div class="flex flex-col">
        <div
          class="font-semibold text-base-content group-hover:text-primary transition-colors duration-200"
        >
          {{ game.name }}
        </div>
        <div class="text-sm text-base-content/60 mt-1">
          Game ID: {{ game.id }}
        </div>
      </div>
    </td>

    <!-- Game Type -->
    <td class="py-4">
      <div class="badge badge-info badge-sm">
        {{ game.type }}
      </div>
    </td>

    <!-- Header Image -->
    <td class="py-4">
      <div class="relative overflow-hidden rounded-lg shadow-lg">
        <img
          :src="game.headerImage"
          :alt="`${game.name} header`"
          class="h-18 object-cover transition-transform duration-300 group-hover:brightness-110"
          loading="lazy"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>
      </div>
    </td>

    <!-- Action Buttons -->
    <td class="text-end py-4" style="min-width: 260px">
      <div class="flex justify-end">
        <ActionButtons
          :game="game"
          class="opacity-70 group-hover:opacity-100 transition-opacity duration-200"
        />
      </div>
    </td>
  </tr>
</template>

<style scoped>
/* Enhanced hover effects - using brightness instead of scale to avoid layout shift */
.group:hover .avatar .w-12 {
  filter: brightness(1.1);
  transition: filter 0.2s ease-in-out;
}

/* Smooth image transitions */
img {
  transition: all 0.3s ease-in-out;
}

/* Custom shadow for header image */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
