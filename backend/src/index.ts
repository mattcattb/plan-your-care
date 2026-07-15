import {app} from "./app";
import {appEnv} from "./env";
import {connectDataStore} from "./store";

await connectDataStore();

console.log(`API running on http://localhost:${appEnv.PORT}`);

export default {
  port: appEnv.PORT,
  fetch: app.fetch,
};
