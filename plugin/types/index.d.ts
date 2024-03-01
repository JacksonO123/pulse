import { PluginOption } from "vite";
export interface Options {
    ssr: boolean;
    babel: babel.TransformOptions | ((source: string, id: string) => babel.TransformOptions) | ((source: string, id: string) => Promise<babel.TransformOptions>);
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
        generate?: "ssr" | "dom";
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
export default function plugin(options?: Partial<Options>): PluginOption;
