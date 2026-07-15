import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";
import {APIProvider} from "@vis.gl/react-google-maps";
import Navbar from "./components/nav-bar";
import "./App.css";

const googleMapsKey = import.meta.env.VITE_GEOCODING_API_KEY;

const MapsSetupRequired = () => (
  <div className="mx-auto mt-32 max-w-2xl rounded-3xl bg-purple-100 p-10 text-left text-[#1F0322] shadow-lg">
    <h1 className="mb-4 text-4xl font-bold">Clinic map setup required</h1>
    <p className="text-lg">
      Add a browser-restricted Google Maps key as <code>VITE_GEOCODING_API_KEY</code>
      in Railway to enable clinic search, Places autocomplete, and the interactive map.
    </p>
  </div>
);

const RootContent = () => (
  <>
    <Navbar />
    <main>
      <Outlet />
    </main>
  </>
);

const RootLayout = () =>
  googleMapsKey ? (
    <APIProvider apiKey={googleMapsKey}>
      <RootContent />
    </APIProvider>
  ) : (
    <RootContent />
  );

const rootRoute = createRootRoute({component: RootLayout});
const routeTree = rootRoute.addChildren([
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: lazyRouteComponent(() => import("./pages/Home")),
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/map",
    component: lazyRouteComponent(() => import("./pages/Map")),
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/clinics",
    component: googleMapsKey
      ? lazyRouteComponent(() => import("./pages/ClinicFinder"))
      : MapsSetupRequired,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/chat",
    component: lazyRouteComponent(() => import("./pages/EmbreChat")),
  }),
]);

const router = createRouter({routeTree, defaultPreload: "intent"});

const App = () => <RouterProvider router={router} />;

export default App;
