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

const RootLayout = () => (
  <APIProvider apiKey={import.meta.env.VITE_GEOCODING_API_KEY || ""}>
    <Navbar />
    <main>
      <Outlet />
    </main>
  </APIProvider>
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
    component: lazyRouteComponent(() => import("./pages/ClinicFinder")),
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
