import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/bastidores',
      name: 'devmode',
      component: () => import('../views/DevModeView.vue'),
    },
    {
      path: '/assistir-depois',
      name: 'watchlist',
      component: () => import('../views/WatchlistView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;


