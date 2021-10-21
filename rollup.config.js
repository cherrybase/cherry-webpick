import resolve from "rollup-plugin-node-resolve";

export default {
  plugins: [
    resolve({
      mainFields: ["module", "main"],
    }),
  ],
};
