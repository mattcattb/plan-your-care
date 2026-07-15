import {apiGet} from "./client";

export const getAllStatesData = async () => {
  const data = await apiGet("states");
  return data.statesData;
};

export const getStateData = async (abbr) => {
  const data = await apiGet("states", {abbr});
  return data.stateData;
};
