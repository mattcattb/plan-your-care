import {describe, expect, test} from "bun:test";
import {app} from "./app";

describe("API", () => {
  test("reports health", async () => {
    const response = await app.request("/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({status: "ok", redis: false});
  });

  test("returns state reference data", async () => {
    const response = await app.request("/api/stateData?abbr=FL");
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
  });
});
