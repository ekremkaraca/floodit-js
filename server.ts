import index from "./src/index.html";

const port = Number(Bun.env.PORT ?? 3000);
const isDev = Bun.env.NODE_ENV !== "production";

const server = Bun.serve({
  port,
  routes: {
    "/": index,
  },
  development: isDev
    ? {
        hmr: true,
        console: true,
      }
    : undefined,
});

console.log(`FloodIt server running at ${server.url}`);
