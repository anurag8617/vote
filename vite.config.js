// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // 👇 ADD THIS BLOCK 👇
  server: {
    proxy: {
      // Any request starting with /api will be forwarded to your backend
      "/api": {
        target: "http://localhost/poll-pulse",
        changeOrigin: true,
      },
    },
  },
});
