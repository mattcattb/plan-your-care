import {createClient} from "redis";
import {clinicsData} from "./seed/clinicSeed.data";
import careResourcesSnapshot from "./seed/generated/careResources.data.json";
import {statesArray} from "./seed/statesSeed.data";
import type {CareResource} from "./types/careResource";

const STATES_KEY = "plan-your-care:states";
const CLINICS_KEY = "plan-your-care:clinics";
const CARE_RESOURCES_KEY = "plan-your-care:care-resources";

const clinics = clinicsData.map((clinic, index) => ({
  ...clinic,
  _id: `${clinic.state.toLowerCase()}-${index + 1}`,
}));
const careResources = careResourcesSnapshot.resources as CareResource[];

let redis: ReturnType<typeof createClient> | null = null;

export const connectDataStore = async () => {
  if (!process.env.REDIS_URL) {
    console.log("REDIS_URL is not set; using bundled read-only data");
    return;
  }

  const client = createClient({url: process.env.REDIS_URL});
  client.on("error", (error) => console.error("Redis error", error));

  try {
    await client.connect();
    await client.mSet({
      [STATES_KEY]: JSON.stringify(statesArray),
      [CLINICS_KEY]: JSON.stringify(clinics),
      [CARE_RESOURCES_KEY]: JSON.stringify(careResources),
    });
    redis = client;
    console.log("Redis connected and reference data loaded");
  } catch (error) {
    console.error("Redis unavailable; using bundled read-only data", error);
    client.destroy();
  }
};

export const isRedisConnected = () => redis?.isReady === true;

const readJson = async <Value>(key: string, fallback: Value): Promise<Value> => {
  if (!redis?.isReady) return fallback;

  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as Value) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key} from Redis; using bundled data`, error);
    return fallback;
  }
};

export const getStates = () => readJson(STATES_KEY, statesArray);
export const getClinics = () => readJson(CLINICS_KEY, clinics);
export const getCareResources = () =>
  readJson(CARE_RESOURCES_KEY, careResources);
export const careResourcesRetrievedAt = careResourcesSnapshot.retrievedAt;
