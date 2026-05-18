<template>
  <div
    class="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
    :style="randomBgImage"
  >
    <h1 class="hdg text-white text-center font-bold text-5xl">
      {{ title }}
    </h1>
    <details class="my-2 p-2 bg-white bg-opacity-75 rounded-md">
      <summary class="cursor-pointer">
        Options in nuxt.config for this demo, along with defaults:
      </summary>
      <div class="pt-2">
        * Includes breakpoints from <code>app/assets/css/main.css</code>
        <div class="text-sm my-2">
          <pre><code>{{ config.public.tailwindBreakpoints }}</code></pre>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue';
import {useHead, useState} from '#imports';
import {useRuntimeConfig} from '#app';

const config = useRuntimeConfig();

const img = useState('img', () => `${Math.floor(Math.random() * 6)}.jpg`);
const randomBgImage = computed(() => {
  return {
    backgroundImage: `url(/img/${img.value})`,
  };
});
const title = ref('Nuxt Tailwind Breakpoints');

useHead({
  title: title,
});
</script>
<style lang="postcss" scoped>
.hdg {
  text-shadow: 1px 1px #000;
}

</style>
