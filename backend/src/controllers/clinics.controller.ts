import {Hono} from "hono";
import {
  careResourcesRetrievedAt,
  getCareResources,
  getClinics,
} from "../store";
import type {CareResourceType} from "../types/careResource";
import {haversineDistance} from "../utils/distance";

const clinicsSource = {
  name: "Bundled Plan Your Care seed",
  kind: "community-maintained",
  warning: "Confirm services directly with a provider before traveling.",
};

const candidateSources = [
  {
    name: "HRSA Health Center Service Delivery and Look-Alike Sites",
    url: "https://data.hrsa.gov/data/download?titleFilter=Health+Center",
    refreshCycle: "daily",
    classification: "general-health-center",
  },
  {
    name: "HHS Title X Family Planning Clinic Locator",
    url: "https://reproductivehealthservices.gov/",
    classification: "family-planning",
  },
  {
    name: "AbortionFinder",
    url: "https://www.abortionfinder.org/",
    classification: "verified-abortion-provider",
  },
] as const;

export const clinicsController = new Hono()
  .get("/sources", (context) => context.json({sources: candidateSources}))
  .get("/resources", async (context) => {
    const state = context.req.query("state")?.toUpperCase();
    const type = context.req.query("type") as CareResourceType | undefined;
    const requestedLimit = Number(context.req.query("limit") || 100);

    if (
      (state && !/^[A-Z]{2}$/.test(state)) ||
      (type && type !== "title-x" && type !== "hrsa-health-center") ||
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1
    ) {
      return context.json({error: "Valid state, type, and limit values are required."}, 400);
    }

    const resources = (await getCareResources()).filter(
      (resource) =>
        (!state || resource.state === state) && (!type || resource.type === type),
    );

    return context.json({
      resources: resources.slice(0, Math.min(requestedLimit, 500)),
      total: resources.length,
      retrievedAt: careResourcesRetrievedAt,
    });
  })
  .get("/resources/nearby", async (context) => {
    const lat = Number(context.req.query("lat"));
    const lng = Number(context.req.query("lng"));
    const maxDistance = Number(context.req.query("maxDistance") || 80000);
    const type = context.req.query("type") as CareResourceType | undefined;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      !Number.isFinite(maxDistance) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180 ||
      maxDistance < 0 ||
      (type && type !== "title-x" && type !== "hrsa-health-center")
    ) {
      return context.json(
        {error: "Valid latitude, longitude, maxDistance, and type values are required."},
        400,
      );
    }

    const resources = (await getCareResources())
      .filter((resource) => !type || resource.type === type)
      .map((resource) => ({
        ...resource,
        distanceMeters: haversineDistance(lat, lng, resource.lat, resource.lng),
      }))
      .filter((resource) => resource.distanceMeters <= maxDistance)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 100);

    return context.json({resources, retrievedAt: careResourcesRetrievedAt});
  })
  .get("/", async (context) =>
    context.json({clinics: await getClinics(), source: clinicsSource}),
  )
  .get("/nearby", async (context) => {
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

    return context.json({clinicsDistance, source: clinicsSource});
  });
