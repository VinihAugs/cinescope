<script setup lang="ts">
import type { MovieSummary } from '../types/movies';
import UiCard from './ui/UiCard.vue';
import UiButton from './ui/UiButton.vue';

const props = defineProps<{
  movie: MovieSummary;
  inWatchlist: boolean;
}>();

const emit = defineEmits<{
  (e: 'open', movie: MovieSummary): void;
  (e: 'toggle', movie: MovieSummary): void;
}>();
</script>

<template>
  <UiCard :interactive="true">
    <template #media>
      <button class="w-full text-left" @click="emit('open', props.movie)">
        <div class="relative aspect-[2/3] bg-neutral-900">
          <img
            v-lazy="props.movie.posterUrl || ''"
            :alt="props.movie.title"
            class="absolute inset-0 w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-3">
            <p class="text-xs font-bold line-clamp-2">{{ props.movie.title }}</p>
            <p class="text-[11px] text-white/70">
              <span v-if="props.movie.year">{{ props.movie.year }}</span>
              <span v-if="props.movie.rating"> · ⭐ {{ props.movie.rating.toFixed(1) }}</span>
            </p>
          </div>
        </div>
      </button>
    </template>

    <template #footer>
      <UiButton
        :variant="props.inWatchlist ? 'secondary' : 'ghost'"
        block
        @click="emit('toggle', props.movie)"
      >
        {{ props.inWatchlist ? '✓ Na lista' : '+ Assistir depois' }}
      </UiButton>
    </template>
  </UiCard>
</template>


