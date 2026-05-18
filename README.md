# Nuxt Tailwind Breakpoints

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Show Tailwind CSS Breakpoints in your Nuxt app. Compatible with **Nuxt 3 and later** and  with both **Tailwind CSS 3 and Tailwind CSS 4**.

## Features

This module reads the breakpoints defined in your Tailwind configuration and displays the currently active breakpoint based on your browser window width.

It will only be loaded in development mode and does not interfere with your production build (unless you set `enableInProd` to `true`).

### Where does the module look for breakpoints?

In order, the module uses the first of the following that is available:

1. The `breakpoints` option you pass to the module (always wins and is used solely when provided).
2. A Tailwind CSS v4 stylesheet containing `@theme { --breakpoint-* }` declarations. The module reads the file at `cssPath` (if you set it) or auto-detects common locations: `~/assets/css/main.css`, `~/assets/css/tailwind.css`, `~~/assets/css/main.css`, `~~/assets/css/tailwind.css`. **CSS overrides are merged on top of Tailwind v4's built-in defaults**; `--breakpoint-name: initial;` removes one, and `--breakpoint-*: initial;` clears them all.
3. A legacy Tailwind v3 JS config (`tailwind.config.js`) referenced by `configPath`. The module reads `theme.screens` directly.
4. Tailwind v4's default breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`) as a final fallback.

**Note**: This project started as a fork of the [nuxt-breaky](https://github.com/teamnovu/nuxt-breaky) module. It should look and act pretty much the same as the original. Changes include removing the `node-sass` dependency to make the module usable with Node.js >= 16, adding a landmark `aria-role` attribute to the `div.current-breakpoint` element, and adding native support for Tailwind v4 CSS-first configuration.


## Quick Setup

1. Add `nuxt3-tailwind-breakpoints` dependency to your project

    ```bash
    # Using yarn
    yarn add --dev nuxt3-tailwind-breakpoints

    # Using npm
    npm install --save-dev nuxt3-tailwind-breakpoints

    # Using pnpm
    pnpm add -D nuxt3-tailwind-breakpoints
    ```

2. Add `nuxt3-tailwind-breakpoints` to the `modules` section of `nuxt.config.ts`

    ```js
    export default defineNuxtConfig({
      modules: [
        'nuxt3-tailwind-breakpoints'
      ]
    })
    ```

### Configuration

In `nuxt.config.ts`, you can pass options to `nuxt3-tailwind-breakpoints` by adding a top-level `tailwindBreakpoints` object:

```js
{
  modules: [
    'nuxt3-tailwind-breakpoints',
  ],
  tailwindBreakpoints: {
    /* module options */
  }
}
```

Or, instead of registering the module as a string value, you can use an array with the first argument the name and the second the options:

```js
{
  modules: [
    ['nuxt3-tailwind-breakpoints', { /* module options */ }]
  ],
}
```

### Options

| Option         | Type                  | Default                   | Options                                                          | Description                                                                                                                                                                                                                                                          |
| -------------- | --------------------- | ------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`      | `Boolean`             | `true`                    | `true` \| `false`                                                | Enable/disable the module.                                                                                                                                                                                                                                            |
| `enableInProd` | `Boolean`             | `false`                   | `true` \| `false`                                                | Enable this module in production (overrides the `enabled` option). Note: this adds a small amount of weight to the client bundle.                                                                                                                                     |
| `breakpoints`  | `Object`              | `null`                    |                                                                  | An object describing the breakpoints you'd like to identify. If provided, it is used _instead of_ reading from CSS or JS config. Values may be strings like `'768px'`, `'48rem'`, or v3-style `{ raw: '...' }` objects (with `parseRaw: true`).                       |
| `cssPath`      | `String \| String[]`  | `null`                    | one or more paths                                                | Path(s) to a Tailwind CSS v4 stylesheet that contains your `@theme { --breakpoint-* }` declarations. When `null`, common locations are auto-detected (`~~/assets/css/main.css`, `~~/assets/css/tailwind.css`, `~~/app/assets/css/main.css`, etc.).                     |
| `configPath`   | `String`              | `'~~/tailwind.config.js'` | any valid path                                                   | Path to a legacy Tailwind v3 JS config file. Used only when no CSS-based breakpoints are detected.                                                                                                                                                                    |
| `colorScheme`  | `String`              | `'auto'`                  | `'auto'` \| `'light'` \| `'dark'`                                | Switch between different color schemes.                                                                                                                                                                                                                               |
| `position`     | `String`              | `'bottomRight'`           | `'topLeft'` \| `'topRight'` \| `'bottomLeft'` \| `'bottomRight'` | The starting position.                                                                                                                                                                                                                                                |
| `offset`       | `Object`              | `{x: 10, y: 10}`          |                                                                  | The number of pixels from a corner of the screen (as determined by `position`) along the `x` and `y` axes. Values for `x` and `y` must be numeric.                                                                                                                    |
| `parseRaw`     | `Boolean`             | `false`                   | `true` \| `false`                                                | (_Experimental, Tailwind v3 only_) Enable parsing a screen's `raw` property and use a query's `min-width` value if it specifies the device type as `screen` or doesn't specify a device type at all. For example, `lg: {raw: 'print, (min-width: 1024px)'}` → `1024`. |

That's it! You can now use Tailwind Breakpoints in your Nuxt app ✨

### Tailwind CSS v4 example

With Tailwind v4, define your breakpoints (and the rest of your theme) directly in CSS:

```css
/* app/assets/css/main.css */
@import "tailwindcss";

@theme {
  --breakpoint-xs: 20rem;
  --breakpoint-3xl: 120rem;
}
```

The module will read this file automatically and merge your overrides on top of Tailwind v4's defaults (`sm`, `md`, `lg`, `xl`, `2xl`). To point at a different file, pass `cssPath`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt3-tailwind-breakpoints'],
  tailwindBreakpoints: {
    cssPath: '~~/app/styles/tailwind.css',
  },
});
```

### Tailwind CSS v3 example

With Tailwind v3, the module reads `theme.screens` from `tailwind.config.js`:

```js
// tailwind.config.js
export default {
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
    },
  },
};
```

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt3-tailwind-breakpoints/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt3-tailwind-breakpoints

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt3-tailwind-breakpoints.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt3-tailwind-breakpoints

[license-src]: https://img.shields.io/npm/l/nuxt3-tailwind-breakpoints.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/kswedberg/nuxt3-tailwind-breakpoints/blob/main/LICENSE

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
