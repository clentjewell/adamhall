import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

// ISR pages (home, /cars, content pages) revalidate through KV
// (binding NEXT_INC_CACHE_KV in wrangler.jsonc). Static assets serve
// from the Worker's asset binding; dynamic routes render in the Worker.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});
