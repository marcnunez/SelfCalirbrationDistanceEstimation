import { defineConfig, searchForWorkspaceRoot } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    assetsInlineLimit: 0, // Ensure .wasm files are not inlined
  },
  optimizeDeps: {
    exclude: ["onnxruntime-web"], // Prevent Vite from messing with ONNX
  },
  server: {
        port: 8080,
        proxy: {
            "/api/": {
                target: "http://localhost:4389/", // random port
                xfwd: true,
            },
        },
        fs: {
            allow: [
                // search up for workspace root
                searchForWorkspaceRoot(process.cwd()),
            ],
        },
    },
});