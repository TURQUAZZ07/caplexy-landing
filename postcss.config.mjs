import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: {
    tailwindcss: {
      config: path.join(configDir, "tailwind.config.ts")
    },
    autoprefixer: {}
  }
};

export default config;
