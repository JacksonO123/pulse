import { transformAsync } from "@babel/core";
import { mergeAndConcat } from "merge-anything";
// @ts-ignore
import jsxTransform from "babel-plugin-jsx-dom-expressions";
function pulsePreset(_, options = {}) {
    const plugins = [
        [
            jsxTransform,
            {
                moduleName: "@jacksonotto/pulse",
                builtIns: [
                    "For",
                    "Show",
                    "Switch",
                    "Match",
                    "Suspense",
                    "SuspenseList",
                    "Portal",
                    "Index",
                    "Dynamic",
                    "ErrorBoundary",
                ],
                contextToCustomElements: true,
                wrapConditionals: true,
                generate: "dom",
                ...options,
            },
        ],
    ];
    return {
        plugins,
    };
}
export default function plugin(options = {}) {
    let projectRoot = process.cwd();
    return {
        name: "pulse",
        enforce: "pre",
        config(userConfig) {
            if (userConfig.root)
                projectRoot = userConfig.root;
        },
        async transform(source, id, transformOptions) {
            let isSsr = transformOptions && transformOptions.ssr;
            if (!/\.[mc]?[tj]sx$/i.test(id))
                return null;
            const plugins = ["jsx"];
            if (id.endsWith(".tsx"))
                plugins.push("typescript");
            let domOptions;
            if (options.ssr) {
                if (isSsr) {
                    domOptions = { generate: "ssr", hydratable: true };
                }
                else {
                    domOptions = { generate: "dom", hydratable: true };
                }
            }
            else {
                domOptions = { generate: "dom", hydratable: false };
            }
            const config = {
                root: projectRoot,
                filename: id,
                sourceFileName: id,
                presets: [[pulsePreset, { ...domOptions, ...(options.pulse || {}) }]],
                ast: false,
                sourceMaps: true,
                configFile: false,
                babelrc: false,
                parserOpts: {
                    plugins,
                },
            };
            let userOptions = {};
            if (options.babel) {
                if (typeof options.babel === "function") {
                    const babelOptions = options.babel(source, id);
                    userOptions =
                        babelOptions instanceof Promise ? await babelOptions : babelOptions;
                }
                else {
                    userOptions = options.babel;
                }
            }
            const babelOptions = mergeAndConcat(userOptions, config);
            const { code, map } = (await transformAsync(source, babelOptions));
            return { code, map };
        },
    };
}
