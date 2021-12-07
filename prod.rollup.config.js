import resolve from "rollup-plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import copy from "rollup-plugin-copy";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { name, version } from "./package.json";
const isProduction = false || process.env.NODE_ENV === "production";
const commonConfig = {
  plugins: [
    json(),
    resolve({
      mainFields: ["module", "main"],
    }),
    commonjs(),
    nodePolyfills(),
    babel({
      babelHelpers: "runtime",
      plugins: ["@babel/plugin-transform-runtime"],
    }),
    ...(isProduction ? [terser()] : []),
    copy({
        targets: [
          { src: 'public/index.html', dest: 'dist' }
        ]
    }),
    serve({
      contentBase: ["dist", "public"],
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      mimeTypes: {
        "application/javascript": ["js_commonjs-proxy"],
      },
      host: "localhost",
      port: 9000,
      onListening: function (server) {
        console.log(
          `Server listening at ${"http"}://${"localhost"}:${"9000"}/`
        );
      },
    }),
    livereload({
      watch: "dist",
    }),
  ],
  watch: {
    clearScreen: false,
    chokidar: {
      useFsEvents: false,
    },
    include: "src/**",
    exclude: "node_modules/**",
  },
};
const commonOutputConfig = {
  banner: "/* sample head :: SDK version " + version + " */",
  footer: "/* sample foot ::  copyrights reserved */",
  intro: `
    const __name = '${name}';
    const __version = '${version}';
    const __dev = true;
  `, // inject into environment
};

export default [
  {
    input: "src/loader-globals.js",
    output: [
      {
        file: `dist/${name}.globals.js`,
        format: "iife",
        name: name,
        ...commonOutputConfig,
      },
      {
        file: `dist/${name}.umd.js`,
        format: "umd",
        name: name,
      },
    ],
    ...commonConfig,
  },
  {
    input: "src/loader-module.js",
    output: [
      {
        file: `dist/${name}.cjs.js`,
        format: "cjs",
      },
      {
        file: `dist/${name}.amd.js`,
        format: "amd",
      },
    ],
    ...commonConfig,
  },
];
