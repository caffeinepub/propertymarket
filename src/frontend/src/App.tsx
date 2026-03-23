import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import CreateListingPage from "./pages/CreateListingPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const propertyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/property/$id",
  component: PropertyDetailPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const createListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-listing",
  component: CreateListingPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  propertyDetailRoute,
  loginRoute,
  dashboardRoute,
  createListingRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
