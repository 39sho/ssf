import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: "esm",
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", /^react\//, "@tanstack/react-form", "@39sho/ssf-core"],
});
