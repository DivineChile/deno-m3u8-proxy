import { Application } from "oak/mod.ts";
import { cacheRoutes } from "./utils/cache-routes.js";
import { router } from "./routes/routes.js";

const app = new Application();

app.use(cacheRoutes(3600)); // Cache for 1 hour
app.use(router.routes());
app.use(router.allowedMethods());

console.log("✅ Deno proxy server running at http://localhost:4040");
await app.listen({ port: 4040 });
