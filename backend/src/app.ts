import {Hono} from "hono";
import {cors} from "hono/cors";
import {logger} from "hono/logger";
import {clinicsController} from "./controllers/clinics.controller";
import {statesController} from "./controllers/states.controller";
import {appEnv} from "./env";
import {isRedisConnected} from "./store";

const allowedOrigins = appEnv.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const app = new Hono()
  .use(logger())
  .use(
    "/api/*",
    cors({
      origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
      allowMethods: ["GET", "OPTIONS"],
      maxAge: 86400,
    }),
  )
  .get("/health", (context) =>
    context.json({status: "ok", redis: isRedisConnected()}),
  )
  .get("/api/health", (context) =>
    context.json({status: "ok", redis: isRedisConnected()}),
  )
  .route("/api/states", statesController)
  .route("/api/clinics", clinicsController)
  // Keep the original hackathon paths working while the frontend migrates.
  .route("/api/stateData", statesController)
  .route("/api/clinic", clinicsController)
  .notFound((context) => context.json({error: "Not found"}, 404))
  .onError((error, context) => {
    console.error(error);
    return context.json({error: "Internal server error"}, 500);
  });

export type AppType = typeof app;
