<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MovieCard from '../components/MovieCard.vue';
import UiButton from '../components/ui/UiButton.vue';
import UiModal from '../components/ui/UiModal.vue';
import { useMovieDetails } from '../composables/useMovieDetails';
import { useWatchlistStore } from '../stores/watchlist';
import type { MovieSummary } from '../types/movies';

const watchlist = useWatchlistStore();
const detailsApi = useMovieDetails();

const selected = ref<MovieSummary | null>(null);
const modalOpen = computed(() => !!selected.value);
const trailerOpen = ref(false);

function openMovie(m: MovieSummary) {
  selected.value = m;
  trailerOpen.value = false;
  detailsApi.fetchDetails(m.mediaType, m.id);
}

function closeMovie() {
  selected.value = null;
  trailerOpen.value = false;
  detailsApi.clear();
}

function playTrailer() {
  if (!detailsApi.trailer.value) return;
  trailerOpen.value = true;
}
</script>

<template>
  <div class="min-h-screen pb-32 pt-24">
    <nav
      class="fixed top-0 left-0 right-0 z-40 bg-neutral-950/80 backdrop-blur-lg border-b border-white/10 px-6 py-4"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-6">
        <RouterLink to="/" class="text-2xl font-black text-red-600 tracking-tighter">
          CINESCOPE
        </RouterLink>
        <div class="flex items-center gap-3">
          <RouterLink
            to="/bastidores"
            class="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
          >
            <span
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-red-500 font-black"
              aria-hidden="true"
            >
              &lt;/&gt;
            </span>
            <span class="hidden sm:inline font-bold">Bastidores</span>
          </RouterLink>
          <RouterLink to="/" class="text-sm font-bold text-neutral-300 hover:text-white transition-colors">
            Voltar
          </RouterLink>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">Assistir Depois ({{ watchlist.count }})</h2>
        <UiButton v-if="watchlist.count" variant="ghost" @click="watchlist.clear()">Limpar</UiButton>
      </div>

      <div
        v-if="watchlist.items.length === 0"
        class="text-center py-20 bg-neutral-900 rounded-2xl border border-dashed border-neutral-800"
      >
        <p class="text-neutral-400 mb-3">Sua lista está vazia.</p>
        <RouterLink to="/" class="text-red-500 font-bold hover:text-red-400">Descobrir títulos</RouterLink>
      </div>

      <TransitionGroup
        v-else
        name="list"
        tag="div"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
      >
        <MovieCard
          v-for="m in watchlist.items"
          :key="m.id"
          :movie="m"
          :in-watchlist="true"
          @open="openMovie"
          @toggle="watchlist.toggle"
        />
      </TransitionGroup>
    </main>

    <UiModal :open="modalOpen" @close="closeMovie">
      <template #title>
        <div class="flex items-center justify-between">
          <div class="min-w-0">
            <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest">Detalhes</p>
            <h3 class="text-lg font-black truncate">
              {{ detailsApi.details.value?.title ?? selected?.title }}
            </h3>
          </div>
          <UiButton variant="ghost" @click="closeMovie">Fechar</UiButton>
        </div>
      </template>

      <div class="p-6 md:p-8">
        <div class="mb-5">
          <div class="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-950 border border-neutral-800">
            <iframe
              v-if="trailerOpen && detailsApi.trailer.value"
              class="absolute inset-0 w-full h-full"
              :src="detailsApi.trailer.value.url"
              :title="detailsApi.trailer.value.name"
              frameborder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen
            />
            <div v-else class="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
              {{ detailsApi.trailer.value ? 'Clique em “Reproduzir trailer”' : 'Trailer indisponível' }}
            </div>
          </div>

          <div class="mt-3">
            <UiButton block size="lg" :disabled="!detailsApi.trailer.value" @click="playTrailer">
              {{ detailsApi.trailer.value ? 'Reproduzir trailer' : 'Trailer indisponível' }}
            </UiButton>
          </div>
        </div>

        <div v-if="detailsApi.loading.value" class="text-neutral-300">Carregando detalhes...</div>
        <div v-else-if="detailsApi.error.value" class="text-red-400">{{ detailsApi.error.value }}</div>
        <div v-else-if="detailsApi.details.value" class="space-y-4">
          <p class="text-neutral-300 leading-relaxed">{{ detailsApi.details.value.overview }}</p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-neutral-500 block mb-1">Gêneros</span>
              <span class="text-white">
                {{ (detailsApi.details.value.genres ?? []).map((g) => g.name).join(', ') || '—' }}
              </span>
            </div>
            <div>
              <span class="text-neutral-500 block mb-1">Direção</span>
              <span class="text-white">{{ detailsApi.details.value.director || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <UiButton variant="ghost" @click="selected && watchlist.remove(selected.id)">Remover da lista</UiButton>
          <UiButton @click="closeMovie">Ok</UiButton>
        </div>
      </template>
    </UiModal>

    <footer class="fixed left-0 right-0 bottom-0 z-30 border-t border-white/10 bg-neutral-950/80 backdrop-blur-lg">
      <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-xs">
        <p class="text-neutral-500">
          CineScope • Feito por
          <a
            class="text-neutral-300 hover:text-white font-bold transition-colors"
            href="https://github.com/VinihAugs"
            target="_blank"
            rel="noreferrer"
          >
            VinihAugs
          </a>
        </p>
        <p class="text-neutral-600">Vue 3 • TMDB</p>
      </div>
    </footer>
  </div>
</template>


