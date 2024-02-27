import { PluginOption } from 'vite';
import { transformAsync, TransformOptions } from '@babel/core';
import { mergeAndConcat } from 'merge-anything';
// @ts-ignore
import jsxTransform from 'babel-plugin-jsx-dom-expressions';

export interface Options {
  ssr: boolean;

  babel:
    | babel.TransformOptions
    | ((source: string, id: string) => babel.TransformOptions)
    | ((source: string, id: string) => Promise<babel.TransformOptions>);

  pulse: {
    /**
     * @default false
     */
    omitNestedClosingTags: boolean;

    /**
     * @default "@jacksonotto/pulse"
     */
    moduleName?: string;

    /**
     * @default "dom"
     */
    generate?: 'ssr' | 'dom';

    /**
     * @default false
     */
    hydratable?: boolean;

    /**
     * @default true
     */
    delegateEvents?: boolean;

    /**
     * @default true
     */
    wrapConditionals?: boolean;

    /**
     * @default true
     */
    contextToCustomElements?: boolean;

    /**
     * @default ["For","Show","Switch","Match","Suspense","SuspenseList","Portal","Index","Dynamic","ErrorBoundary"]
     */
    builtIns?: string[];
  };
}

function pulsePreset(context: any, options = {}) {
  const plugins = [
    [
      jsxTransform,
      {
        moduleName: '@jacksonotto/pulse',
        builtIns: [
          'For',
          'Show',
          'Switch',
          'Match',
          'Suspense',
          'SuspenseList',
          'Portal',
          'Index',
          'Dynamic',
          'ErrorBoundary'
        ],
        contextToCustomElements: true,
        wrapConditionals: true,
        generate: 'dom',
        ...options
      }
    ]
  ];

  return {
    plugins
  };
}

export default function plugin(options: Partial<Options> = {}) {
  let projectRoot = process.cwd();

  return {
    name: 'pulse',
    enforce: 'pre',

    config(userConfig) {
      if (userConfig.root) projectRoot = userConfig.root;
    },

    async transform(source, id, transformOptions) {
      let isSsr = transformOptions && transformOptions.ssr;

      if (!/\.[mc]?[tj]sx$/i.test(id)) return null;

      const plugins: NonNullable<NonNullable<babel.TransformOptions['parserOpts']>['plugins']> = ['jsx'];

      if (id.endsWith('.tsx')) plugins.push('typescript');

      let domOptions: { generate: 'ssr' | 'dom'; hydratable: boolean };

      if (options.ssr) {
        if (isSsr) {
          domOptions = { generate: 'ssr', hydratable: true };
        } else {
          domOptions = { generate: 'dom', hydratable: true };
        }
      } else {
        domOptions = { generate: 'dom', hydratable: false };
      }

      const config: TransformOptions = {
        root: projectRoot,
        filename: id,
        sourceFileName: id,
        presets: [[pulsePreset, { ...domOptions, ...(options.pulse || {}) }]],
        ast: false,
        sourceMaps: true,
        configFile: false,
        babelrc: false,
        parserOpts: {
          plugins
        }
      };

      let userOptions: babel.TransformOptions = {};

      if (options.babel) {
        if (typeof options.babel === 'function') {
          const babelOptions = options.babel(source, id);
          userOptions = babelOptions instanceof Promise ? await babelOptions : babelOptions;
        } else {
          userOptions = options.babel;
        }
      }

      const babelOptions = mergeAndConcat(userOptions, config);

      const { code, map } = (await transformAsync(source, babelOptions))!;

      return { code, map };
    }
  } as PluginOption;
}
