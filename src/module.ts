import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {
  defineNuxtModule,
  addPlugin,
  addComponent,
  createResolver,
  resolveAlias,
  importModule,
  useLogger,
} from '@nuxt/kit';

export interface ModuleOptions {
  /** Explicit breakpoints map. When set, skips both CSS and JS config detection. */
  breakpoints: Record<string, unknown> | null;
  enableInProd: boolean;
  enabled: boolean;
  colorScheme: 'auto' | 'light' | 'dark';
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  /**
   * Path(s) to your Tailwind CSS v4 entry stylesheet. Used to read
   * `@theme { --breakpoint-* }` declarations.
   * Pass a single path, an array of paths, or `null` to auto-detect
   * common locations (e.g. `~~/assets/css/main.css`).
   */
  cssPath: string | string[] | null;
  /** Path to a legacy Tailwind v3 JS config (used only as a fallback). */
  configPath: string;
  /** Parse a v3 screen's `raw` value when looking for a `min-width` query. */
  parseRaw: boolean;
  offset: {
    x: number;
    y: number;
  };
}

// Tailwind v4 default breakpoints, kept in sync with `tailwindcss/theme.css`.
const TAILWIND_V4_DEFAULT_BREAKPOINTS: Record<string, string> = {
  sm: '40rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  '2xl': '96rem',
};

const DEFAULT_CSS_CANDIDATES = [
  '~/assets/css/main.css',
  '~/assets/css/tailwind.css',
  '~~/assets/css/main.css',
  '~~/assets/css/tailwind.css',
];

// Match `@theme [<modifier>] { ... }` blocks. `[^{}]` avoids the
// super-linear backtracking that `[^{]*` would allow.
const THEME_BLOCK_RE = /@theme\b[^{}]*\{([^{}]*)\}/g;
// Match `--breakpoint-<name>: <value>;` inside a theme block. The value
// is required to start with a non-whitespace char to keep the regex linear.
const BREAKPOINT_DECL_RE = /--breakpoint-([\w-]+)\s*:\s*(\S[^;]*);/g;
// Match `--breakpoint-*: initial;` to clear all default breakpoints.
const BREAKPOINT_CLEAR_RE = /--breakpoint-\*\s*:\s*initial\s*;/;

const isInitialValue = (value: string) => value === 'initial' || value === '--initial';

/**
 * Parse `@theme { ... }` blocks in a CSS string and return the resolved
 * `--breakpoint-*` map, merged on top of Tailwind v4 defaults.
 */
const parseCssBreakpoints = (css: string): Record<string, string> => {
  const breakpoints = new Map<string, string>(Object.entries(TAILWIND_V4_DEFAULT_BREAKPOINTS));

  let blockMatch: RegExpExecArray | null;

  THEME_BLOCK_RE.lastIndex = 0;
  while ((blockMatch = THEME_BLOCK_RE.exec(css)) !== null) {
    const body = blockMatch[1] ?? '';

    if (BREAKPOINT_CLEAR_RE.test(body)) {
      breakpoints.clear();
    }

    let declMatch: RegExpExecArray | null;

    BREAKPOINT_DECL_RE.lastIndex = 0;
    while ((declMatch = BREAKPOINT_DECL_RE.exec(body)) !== null) {
      const name = declMatch[1]?.trim() ?? '';
      const value = declMatch[2]?.trim() ?? '';

      if (isInitialValue(value)) {
        breakpoints.delete(name);
        continue;
      }
      breakpoints.set(name, value);
    }
  }

  return Object.fromEntries(breakpoints);
};

const resolveCssCandidates = (cssPath: ModuleOptions['cssPath']): string[] => {
  if (Array.isArray(cssPath)) {
    return cssPath;
  }
  if (cssPath) {
    return [cssPath];
  }

  return DEFAULT_CSS_CANDIDATES;
};

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt3-tailwind-breakpoints',
    configKey: 'tailwindBreakpoints',
    compatibility: {
      // Nuxt 3 and Nuxt 4 are both supported
      nuxt: '>=3.0.0',
    },
  },
  defaults: (): ModuleOptions => ({
    enabled: true,
    enableInProd: false,
    colorScheme: 'auto',
    position: 'bottomRight',
    configPath: '~~/tailwind.config.js',
    cssPath: null,
    breakpoints: null,
    parseRaw: false,
    offset: {
      x: 10,
      y: 10,
    },
  }),
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const logger = useLogger('nuxt3-tailwind-breakpoints');

    if (!options.enabled || (!nuxt.options.dev && !options.enableInProd)) {
      return;
    }

    let resolvedBreakpoints: Record<string, unknown> | null = options.breakpoints;

    if (!resolvedBreakpoints) {
      const cssCandidates = resolveCssCandidates(options.cssPath);

      for (const candidate of cssCandidates) {
        const cssFile = resolveAlias(candidate);

        if (!existsSync(cssFile)) {
          continue;
        }

        try {
          // eslint-disable-next-line no-await-in-loop -- sequential lookup with an early break
          const css = await readFile(cssFile, 'utf8');
          const parsed = parseCssBreakpoints(css);

          if (Object.keys(parsed).length) {
            resolvedBreakpoints = parsed;
            logger.info(`Using Tailwind breakpoints from ${candidate}`);
            break;
          }
        } catch (error) {
          logger.warn(`Could not read CSS file at ${candidate}:`, error);
        }
      }
    }

    if (!resolvedBreakpoints) {
      const jsConfigPath = resolveAlias(options.configPath);

      if (existsSync(jsConfigPath)) {
        try {
          const tailwindConfig = await importModule<Record<string, any>>(jsConfigPath);
          const screens = tailwindConfig?.theme?.screens ??
            tailwindConfig?.theme?.extend?.screens ??
            null;

          if (screens && Object.keys(screens).length) {
            resolvedBreakpoints = screens;
            logger.info(`Using Tailwind breakpoints from ${options.configPath}`);
          }
        } catch (error) {
          logger.warn(`Could not load Tailwind config at ${options.configPath}:`, error);
        }
      }
    }

    if (!resolvedBreakpoints) {
      resolvedBreakpoints = {...TAILWIND_V4_DEFAULT_BREAKPOINTS};
      logger.info('Using default Tailwind v4 breakpoints');
    }

    // eslint-disable-next-line require-atomic-updates
    options.breakpoints = resolvedBreakpoints;

    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {};
    // Cast: the public runtime config schema is generated by Nuxt during
    // `prepare` based on the actual runtime values, so we widen here.
    nuxt.options.runtimeConfig.public.tailwindBreakpoints = options as never;

    addPlugin(resolver.resolve('./runtime/plugin'));

    addComponent({
      name: 'TailwindBreakpoints',
      filePath: resolver.resolve('./runtime/components/TailwindBreakpoints'),
    });

    logger.success('nuxt3-tailwind-breakpoints loaded');
  },
});
