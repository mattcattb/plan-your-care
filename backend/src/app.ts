import {Hono} from "hono";
import {cors} from "hono/cors";
import {logger} from "hono/logger";
import {appEnv} from "./env";
import {getClinics, getStates, isRedisConnected} from "./store";
import {haversineDistance} from "./utils/distance";

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
  .get("/api/stateData", async (context) => {
    const statesData = await getStates();
    const abbr = context.req.query("abbr")?.toUpperCase();

    if (!abbr) return context.json({statesData});

    const stateData = statesData.find((state) => state.abbr === abbr);
    return stateData
      ? context.json({stateData})
      : context.json({message: `No state found for abbr ${abbr}`}, 404);
  })
  .get("/api/clinic", async (context) =>
    context.json({clinics: await getClinics()}),
  )
  .get("/api/clinic/nearby", async (context) => {
    const lat = Number(context.req.query("lat"));
    const lng = Number(context.req.query("lng"));
    const maxDistance = Number(context.req.query("maxDistance") || 5000);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      !Number.isFinite(maxDistance) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180 ||
      maxDistance < 0
    ) {
      return context.json(
        {error: "Valid latitude, longitude, and maxDistance values are required."},
        400,
      );
    }

    const clinics = await getClinics();
    const clinicsDistance = clinics
      .map((clinic) => ({
        clinic,
        distance: haversineDistance(lat, lng, clinic.lat, clinic.lng),
      }))
      .filter(({distance}) => distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .map(({clinic}) => clinic);

    return context.json({clinicsDistance});
  })
  .notFound((context) => context.json({error: "Not found"}, 404))
  .onError((error, context) => {
    console.error(error);
    return context.json({error: "Internal server error"}, 500);
  });

export type AppType = typeof app;
