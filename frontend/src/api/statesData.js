import {apiGet} from "./client";

export const getAllStatesData = async () => {
  const data = await apiGet("stateData");
  return data.statesData;
};

export const getStateData = async (abbr) => {
  const data = await apiGet("stateData", {abbr});
  return data.stateData;
};
