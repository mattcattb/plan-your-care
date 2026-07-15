import {Hono} from "hono";
import {getStates} from "../store";

export const statesController = new Hono().get("/", async (context) => {
  const statesData = await getStates();
  const abbr = context.req.query("abbr")?.toUpperCase();

  if (!abbr) return context.json({statesData});

  const stateData = statesData.find((state) => state.abbr === abbr);
  return stateData
    ? context.json({stateData})
    : context.json({message: `No state found for abbr ${abbr}`}, 404);
});
