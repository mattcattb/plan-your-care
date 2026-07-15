import {apiGet} from "./client";

export const getNearbyClinics = async (lat, lng, maxDistance = 5000) => {
  const data = await apiGet("clinic/nearby", {lat, lng, maxDistance});
  return data.clinicsDistance;
};

export const getAllClinics = async () => {
  const data = await apiGet("clinic");
  return data.clinics;
};
