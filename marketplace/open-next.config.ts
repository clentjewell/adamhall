import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config: static assets served from the Worker's asset binding,
// dynamic routes rendered in the Worker. Add an R2 incremental cache here
// if/when ISR volume justifies it.
export default defineCloudflareConfig();
