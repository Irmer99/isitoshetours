import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import url from "node:url";
import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";
import { createProxyMiddleware } from "http-proxy-middleware";

process.env.NODE_ENV = process.env.NODE_ENV ?? "production";
sourceMapSupport.install({
  retrieveSourceMap(source) {
    if (source.startsWith("file://")) {
      const sourceMapPath = `${url.fileURLToPath(source)}.map`;
      if (fs.existsSync(sourceMapPath)) {
        return { source, map: fs.readFileSync(sourceMapPath, "utf8") };
      }
    }
    return null;
  },
});

const port = Number(process.env.PORT) || 3000;
const buildPath = path.resolve("build/server/index.js");
const buildModule = await import(url.pathToFileURL(buildPath).href);

const app = express();
app.disable("x-powered-by");
app.use(compression());

const publicPath = "/";
const assetsBuildDirectory = path.join("build", "client");

app.use(
  path.posix.join(publicPath, "assets"),
  express.static(path.join(assetsBuildDirectory, "assets"), {
    immutable: true,
    maxAge: "1y",
  })
);
app.use(publicPath, express.static(assetsBuildDirectory));
app.use(express.static("public", { maxAge: "1h" }));
app.use(morgan("tiny"));

const apiTarget = process.env.SSR_API_URL || "http://localhost:3000/api";
const apiTargetOrigin = apiTarget.replace(/\/api$/, "");
app.use(
  "/api",
  createProxyMiddleware({
    target: apiTargetOrigin,
    changeOrigin: true,
  })
);
app.use(
  "/uploads",
  createProxyMiddleware({
    target: apiTargetOrigin,
    changeOrigin: true,
  })
);

app.all(
  "/{*splat}",
  createRequestHandler({
    build: buildModule,
    mode: process.env.NODE_ENV,
  })
);

const server = app.listen(port, "0.0.0.0", () => {
  const address =
    process.env.HOST ||
    Object.values(os.networkInterfaces())
      .flat()
      .find((ip) => String(ip?.family).includes("4") && !ip?.internal)
      ?.address;
  if (!address) console.log(`[server] http://localhost:${port}`);
  else console.log(`[server] http://localhost:${port} (http://${address}:${port})`);
});

["SIGTERM", "SIGINT"].forEach((signal) => {
  process.once(signal, () => server?.close(console.error));
});
