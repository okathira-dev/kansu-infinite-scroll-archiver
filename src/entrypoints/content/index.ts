import { startContentEngine } from "./engine";

export default defineContentScript({
  matches: ["<all_urls>"],
  async main() {
    await startContentEngine();
  },
});
