import {createApp} from 'vue';
import TailwindBreakpoints from './components/TailwindBreakpoints.vue';
import {defineNuxtPlugin, useRuntimeConfig} from '#app';


export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const twbConfig = config.public.tailwindBreakpoints || {};
  const twb = createApp({
    extends: TailwindBreakpoints,
    devtools: {
      hide: true,
    },
  }, {
    ...twbConfig,
  });

  if (typeof document !== 'undefined' && document.createElement) {
    const mountElement = document.createElement('div');

    mountElement.id = 'tailwind-breakpoints';
    mountElement.setAttribute('data-v-inspector-ignore', 'true');

    document.body.appendChild(mountElement);
    twb.mount(mountElement);
  }
});
