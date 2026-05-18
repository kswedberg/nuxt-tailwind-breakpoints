import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  devServer: {
    port: 3113,
  },
  srcDir: 'app/',
  modules: ['../src/module', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],

  tailwindBreakpoints: {
    // colorScheme: 'dark',
    // enabled: false,
  },

  devtools: {enabled: true},

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
    },
  },

  compatibilityDate: '2026-05-13',
});
