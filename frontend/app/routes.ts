import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/home.tsx"),
  route("code/:id", "routes/code/code.$id.tsx"),
] satisfies RouteConfig;
