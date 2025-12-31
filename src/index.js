import { handlePoeProxy } from "../functions/poe-proxy.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route your proxy endpoint
    if (url.pathname === "/api/poe") {
      return handlePoeProxy(request, env, ctx);
    }

    // Everything else: let static assets handle it.
    // Returning 404 here is OK; assets middleware serves files before this when configured.
    return new Response("Not found", { status: 404 });
  },
};