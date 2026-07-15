const port = Number(process.env.PORT || 4173);
const apiUrl = (process.env.API_URL || "http://localhost:3000").replace(/\/$/, "");
const distDir = new URL("./dist/", import.meta.url);

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
};

const serveFile = async (pathname: string) => {
  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decodedPathname.includes("..") || decodedPathname.includes("\\")) return null;

  const normalized = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = Bun.file(new URL(normalized, distDir));
  if (!(await file.exists())) return null;

  const extension = normalized.match(/\.[^.]+$/)?.[0] || "";
  return new Response(file, {
    headers: {
      "Content-Type": contentTypes[extension] || file.type || "application/octet-stream",
      "Cache-Control": normalized === "index.html" ? "no-cache" : "public, max-age=31536000, immutable",
    },
  });
};

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({status: "ok"});
    }

    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      const target = `${apiUrl}${url.pathname}${url.search}`;
      return fetch(new Request(target, request));
    }

    const response = (await serveFile(url.pathname)) || (await serveFile("/"));
    return response || new Response("Not found", {status: 404});
  },
});

console.log(`Web server running on http://localhost:${port}`);
