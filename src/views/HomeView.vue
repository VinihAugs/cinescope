<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import MovieCard from '../components/MovieCard.vue';
import UiButton from '../components/ui/UiButton.vue';
import UiModal from '../components/ui/UiModal.vue';
import DevModeDrawer from '../components/DevModeDrawer.vue';
import { useMovies } from '../composables/useMovies';
import { useMovieDetails } from '../composables/useMovieDetails';
import { useWatchlistStore } from '../stores/watchlist';
import { useUiStore } from '../stores/ui';
import type { MovieSummary } from '../types/movies';

const watchlist = useWatchlistStore();
const ui = useUiStore();
const moviesApi = useMovies();
const detailsApi = useMovieDetails();

const selected = ref<MovieSummary | null>(null);
const modalOpen = computed(() => !!selected.value);
const trailerOpen = ref(false);

const topGenres = computed(() => moviesApi.genres.value.slice(0, 10));
const selectedGenreName = computed(() => {
  const id = moviesApi.selectedGenreId.value;
  if (!id) return 'Em alta';
  return moviesApi.genres.value.find((g) => g.id === id)?.name ?? 'Gênero';
});

const debounced = ref<number | null>(null);
function onInput() {
  if (debounced.value) window.clearTimeout(debounced.value);
  debounced.value = window.setTimeout(() => moviesApi.search(), 350);
}

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

function onPickGenre(id: number | null) {
  moviesApi.query.value = '';
  moviesApi.setGenre(id);
  moviesApi.fetchDiscover();
}

watch(
  () => moviesApi.mediaType.value,
  () => {
    closeMovie();
  },
);
</script>

<template>
  <div class="min-h-screen pb-32">
    <nav
      class="fixed top-0 left-0 right-0 z-40 bg-neutral-950/80 backdrop-blur-lg border-b border-white/10 px-6 py-4"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-6">
        <div class="flex items-center gap-8">
          <RouterLink to="/" class="flex items-center gap-3 text-2xl font-black text-red-600 tracking-tighter">
            <img src="/camera-de-video.png" alt="CineScope" class="w-8 h-8" />
            <span>CINESCOPE</span>
          </RouterLink>

          <div class="hidden md:flex items-center gap-4 text-sm font-medium">
            <button
              class="transition-colors"
              :class="moviesApi.mediaType.value === 'movie' ? 'text-white' : 'text-neutral-500 hover:text-white'"
              @click="moviesApi.setMediaType('movie')"
            >
              Filmes
            </button>
            <button
              class="transition-colors"
              :class="moviesApi.mediaType.value === 'tv' ? 'text-white' : 'text-neutral-500 hover:text-white'"
              @click="moviesApi.setMediaType('tv')"
            >
              Séries
            </button>
            <RouterLink
              to="/assistir-depois"
              class="transition-colors"
              :class="'text-neutral-500 hover:text-white'"
            >
              Assistir Depois ({{ watchlist.count }})
            </RouterLink>
            <button
              class="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors"
              @click="ui.openDevMode()"
              type="button"
            >
              <span
                class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-red-500 font-black"
                aria-hidden="true"
              >
                &lt;/&gt;
              </span>
              <span class="hidden lg:inline font-bold">Bastidores</span>
            </button>
          </div>
        </div>

        <div class="flex-1 max-w-md relative group">
          <input
            v-model="moviesApi.query.value"
            type="text"
            placeholder="Pesquisar..."
            class="w-full bg-neutral-900 border border-neutral-800 rounded-full py-2 px-10 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all text-sm"
            @input="onInput"
          />
          <svg
            class="absolute left-3 top-2.5 text-neutral-500"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>
    </nav>

    <div v-if="moviesApi.hero.value" class="relative h-[70vh] w-full overflow-hidden">
      <img
        v-lazy="moviesApi.hero.value.backdropUrl || moviesApi.hero.value.posterUrl || ''"
        :alt="moviesApi.hero.value.title"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

      <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:px-24 max-w-7xl mx-auto">
        <div class="max-w-2xl">
          <span
            class="inline-block px-2 py-1 mb-4 text-xs font-bold tracking-wider text-red-600 border border-red-600 rounded"
          >
            DESTAQUE
          </span>
          <h2 class="text-4xl md:text-6xl font-black mb-4 uppercase leading-tight">
            {{ moviesApi.hero.value.title }}
          </h2>
          <p class="text-neutral-300 mb-8 line-clamp-3 text-lg">
            {{ moviesApi.hero.value.overview }}
          </p>

          <div class="flex items-center gap-4">
            <UiButton size="lg" @click="openMovie(moviesApi.hero.value)">Ver detalhes</UiButton>
            <UiButton
              size="lg"
              variant="secondary"
              @click="watchlist.toggle(moviesApi.hero.value)"
            >
              {{ watchlist.isInList(moviesApi.hero.value.id) ? '✓ Na Lista' : '+ Assistir Depois' }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <main
      class="max-w-7xl mx-auto px-6"
      :class="moviesApi.hero.value ? 'mt-[-40px] pt-10 relative z-10' : 'pt-24'"
    >
      <div v-if="!moviesApi.query.value" class="flex items-center gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
        <button
          class="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap"
          :class="moviesApi.selectedGenreId.value === null ? 'bg-red-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'"
          @click="onPickGenre(null)"
        >
          Em alta
        </button>

        <button
          v-for="g in topGenres"
          :key="g.id"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap"
          :class="moviesApi.selectedGenreId.value === g.id ? 'bg-red-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'"
          @click="onPickGenre(g.id)"
        >
          {{ g.name }}
        </button>
      </div>

      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">
          <span v-if="moviesApi.query.value">Resultados para "{{ moviesApi.query.value }}"</span>
          <span v-else>{{ selectedGenreName }}</span>
        </h2>
      </div>

      <div v-if="moviesApi.loading.value" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <div v-for="i in 12" :key="i" class="aspect-[2/3] bg-neutral-900 rounded-xl animate-pulse" />
      </div>

      <div v-else-if="moviesApi.error.value" class="text-center py-20 bg-neutral-900 rounded-2xl">
        <p class="text-neutral-400 mb-4">{{ moviesApi.error.value }}</p>
        <UiButton variant="ghost" @click="moviesApi.fetchTrending()">Tentar novamente</UiButton>
      </div>

      <div
        v-else-if="moviesApi.movies.value.length === 0"
        class="text-center py-20 bg-neutral-900 rounded-2xl border border-dashed border-neutral-800"
      >
        <p class="text-neutral-400">Nada encontrado.</p>
      </div>

      <TransitionGroup
        v-else
        name="list"
        tag="div"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
      >
        <MovieCard
          v-for="m in moviesApi.movies.value"
          :key="m.id"
          :movie="m"
          :in-watchlist="watchlist.isInList(m.id)"
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

      <div class="flex flex-col">
        <div class="relative aspect-video w-full overflow-hidden bg-neutral-950">
          <iframe
            v-if="trailerOpen && detailsApi.trailer.value"
            class="absolute inset-0 w-full h-full"
            :src="detailsApi.trailer.value.url"
            :title="detailsApi.trailer.value.name"
            frameborder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
          />
          <img
            v-else
            v-lazy="detailsApi.details.value?.backdropUrl || selected?.backdropUrl || ''"
            :alt="detailsApi.details.value?.title ?? selected?.title ?? 'Poster'"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent pointer-events-none" />
        </div>

        <div class="p-6 md:p-8">
          <div v-if="detailsApi.loading.value" class="text-neutral-300">Carregando detalhes...</div>
          <div v-else-if="detailsApi.error.value" class="text-red-400">{{ detailsApi.error.value }}</div>

          <div v-else-if="detailsApi.details.value" class="flex flex-col md:flex-row gap-8">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-4 text-sm text-neutral-300">
                <span v-if="detailsApi.details.value.year" class="text-neutral-400">{{ detailsApi.details.value.year }}</span>
                <span v-if="detailsApi.details.value.rating">⭐ {{ detailsApi.details.value.rating.toFixed(1) }}</span>
                <span v-if="detailsApi.details.value.runtimeMinutes" class="text-neutral-400">
                  {{ detailsApi.details.value.runtimeMinutes }} min
                </span>
              </div>
              <p v-if="detailsApi.details.value.tagline" class="text-neutral-300 italic mb-3">
                “{{ detailsApi.details.value.tagline }}”
              </p>
              <p class="text-neutral-300 leading-relaxed">
                {{ detailsApi.details.value.overview }}
              </p>

              <div class="grid grid-cols-2 gap-4 text-sm mt-6">
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

            <div class="w-full md:w-64 flex flex-col gap-3">
              <UiButton block size="lg" :disabled="!detailsApi.trailer.value" @click="playTrailer">
                {{ detailsApi.trailer.value ? 'Reproduzir trailer' : 'Trailer indisponível' }}
              </UiButton>
              <UiButton
                block
                size="lg"
                variant="secondary"
                @click="selected && watchlist.toggle(selected)"
              >
                {{ selected && watchlist.isInList(selected.id) ? '✓ Na sua Lista' : '+ Assistir Depois' }}
              </UiButton>

              <div class="mt-2 p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
                <h4 class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Elenco</h4>
                <p class="text-sm text-neutral-300">
                  {{ (detailsApi.details.value.cast ?? []).join(', ') || '—' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UiModal>

    <div
      class="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-lg border-t border-white/10 px-6 py-3 flex items-center justify-around z-50"
    >
      <RouterLink to="/" class="flex flex-col items-center gap-1 text-red-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        </svg>
        <span class="text-[10px] font-bold">Início</span>
      </RouterLink>
      <RouterLink to="/assistir-depois" class="flex flex-col items-center gap-1 text-neutral-400">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="text-[10px] font-bold">Lista</span>
      </RouterLink>
      <button
        type="button"
        class="flex flex-col items-center gap-1 text-neutral-400"
        @click="ui.openDevMode()"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 9l-3 3 3 3"></path>
          <path d="M16 9l3 3-3 3"></path>
          <path d="M14 7l-4 10"></path>
        </svg>
        <span class="text-[10px] font-bold">Dev</span>
      </button>
    </div>

    <DevModeDrawer :open="ui.devModeOpen" @close="ui.closeDevMode()" />

    <footer class="fixed left-0 right-0 bottom-16 md:bottom-0 z-30 border-t border-white/10 bg-neutral-950/80 backdrop-blur-lg">
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


