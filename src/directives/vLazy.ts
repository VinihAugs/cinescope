import type { Directive } from 'vue';

type LazyValue =
  | string
  | {
      src: string;
      srcset?: string;
      sizes?: string;
    };

const TRANSPARENT_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

function getSrc(value: LazyValue): { src: string; srcset?: string; sizes?: string } {
  if (typeof value === 'string') return { src: value };
  return value;
}

export const vLazy: Directive<HTMLImageElement, LazyValue> = {
  mounted(el, binding) {
    const initial = getSrc(binding.value);
    let observer: IntersectionObserver | null = null;

    const load = (cfg: { src: string; srcset?: string; sizes?: string }) => {
      if (!cfg.src) return;
      el.decoding = 'async';
      el.loading = 'eager';
      el.src = cfg.src;
      if (cfg.srcset) el.srcset = cfg.srcset;
      if (cfg.sizes) el.sizes = cfg.sizes;
    };

    const onLoad = () => {
      el.classList.add('lazy-loaded');
      el.classList.remove('opacity-0');
      el.classList.add('opacity-100');
    };

    el.classList.add('transition-opacity', 'duration-700', 'ease-in-out', 'opacity-0');
    el.addEventListener('load', onLoad, { once: true });
    if (!el.getAttribute('src')) el.setAttribute('src', TRANSPARENT_PLACEHOLDER);
    el.setAttribute('data-v-lazy-src', initial.src);

    if (!('IntersectionObserver' in window)) {
      load(initial);
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        load(initial);
        observer?.disconnect();
        observer = null;
      },
      { rootMargin: '200px 0px', threshold: 0.01 },
    );

    observer.observe(el);

    (el as any).__vLazyCleanup = () => {
      observer?.disconnect();
      observer = null;
    };
  },
  updated(el, binding) {
    const nextCfg = getSrc(binding.value);
    const current = el.getAttribute('data-v-lazy-src') ?? '';
    if (current === nextCfg.src) return;

    el.setAttribute('data-v-lazy-src', nextCfg.src);
    el.classList.remove('lazy-loaded');
    el.classList.remove('opacity-100');
    el.classList.add('opacity-0');
    el.setAttribute('src', TRANSPARENT_PLACEHOLDER);

    const onLoad = () => {
      el.classList.add('lazy-loaded');
      el.classList.remove('opacity-0');
      el.classList.add('opacity-100');
    };
    el.addEventListener('load', onLoad, { once: true });

    const cleanup = (el as any).__vLazyCleanup as undefined | (() => void);
    cleanup?.();

    const load = () => {
      if (!nextCfg.src) return;
      el.decoding = 'async';
      el.loading = 'eager';
      el.src = nextCfg.src;
      if (nextCfg.srcset) el.srcset = nextCfg.srcset;
      if (nextCfg.sizes) el.sizes = nextCfg.sizes;
    };

    if (!('IntersectionObserver' in window)) {
      load();
      return;
    }

    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        load();
        observer?.disconnect();
        observer = null;
      },
      { rootMargin: '200px 0px', threshold: 0.01 },
    );

    observer.observe(el);
    (el as any).__vLazyCleanup = () => {
      observer?.disconnect();
      observer = null;
    };
  },
  unmounted(el) {
    const cleanup = (el as any).__vLazyCleanup as undefined | (() => void);
    cleanup?.();
  },
};


