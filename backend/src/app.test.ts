import {describe, expect, test} from "bun:test";
import {app} from "./app";

describe("API", () => {
  test("reports health", async () => {
    const response = await app.request("/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({status: "ok", redis: false});
  });

  test("reports Redis status through the public API proxy path", async () => {
    const response = await app.request("/api/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({status: "ok", redis: false});
  });

  test("returns state reference data", async () => {
    const response = await app.request("/api/stateData?abbr=FL");
    expect(response.status).toBe(200);
    expect((await response.json()).stateData.abbr).toBe("FL");
  });

  test("exposes the state surface at its canonical path", async () => {
    const response = await app.request("/api/states?abbr=FL");
    expect(response.status).toBe(200);
    expect((await response.json()).stateData.abbr).toBe("FL");
  });

  test("returns all 50 states with unique abbreviations", async () => {
    const response = await app.request("/api/stateData");
    const {statesData} = await response.json();
    expect(statesData).toHaveLength(50);
    expect(new Set(statesData.map((state: {abbr: string}) => state.abbr)).size).toBe(50);
  });

  test("validates nearby clinic coordinates", async () => {
    const response = await app.request("/api/clinic/nearby?lat=nope&lng=-82");
    expect(response.status).toBe(400);
  });

  test("returns nearby clinics in distance order", async () => {
    const response = await app.request(
      "/api/clinic/nearby?lat=29.66&lng=-82.34&maxDistance=10000",
    );
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.clinicsDistance.length).toBeGreaterThan(0);
    expect(data.source.kind).toBe("community-maintained");
  });

  test("normalizes all seeded clinic state codes", async () => {
    const response = await app.request("/api/clinics");
    const data = await response.json();
    expect(data.clinics.every((clinic: {state: string}) => /^[A-Z]{2}$/.test(clinic.state))).toBe(true);
  });

  test("publishes classified care-data sources", async () => {
    const response = await app.request("/api/clinics/sources");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.sources.map((source: {classification: string}) => source.classification)).toContain(
      "general-health-center",
    );
  });

  test("returns nationally seeded Title X resources", async () => {
    const response = await app.request("/api/clinics/resources?state=FL&type=title-x&limit=5");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.resources).toHaveLength(5);
    expect(data.total).toBeGreaterThan(5);
    expect(data.resources.every((resource: {type: string}) => resource.type === "title-x")).toBe(true);
  });

  test("returns nearby care resources ordered by distance", async () => {
    const response = await app.request(
      "/api/clinics/resources/nearby?lat=38.9072&lng=-77.0369&type=title-x&maxDistance=20000",
    );
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.resources.length).toBeGreaterThan(0);
    expect(data.resources[0].distanceMeters).toBeLessThanOrEqual(
      data.resources.at(-1).distanceMeters,
    );
  });
});
