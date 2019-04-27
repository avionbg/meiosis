import { createRouter } from "./util";
import { Route } from "routing-common/src/routes";

const beverageRoutes = {
  Beverages: "",
  Beverage: [
    "/:id",
    {
      Brewer: "/brewer"
    }
  ]
};

const routeConfig = {
  Home: "/",
  Login: "/login",
  Settings: "/settings",
  Tea: [
    "/tea",
    {
      TeaDetails: "/:id"
    }
  ],
  Coffee: ["/coffee", beverageRoutes],
  Beer: ["/beer", beverageRoutes]
};

export const router = createRouter({
  routeConfig,
  defaultRoute: [Route.Home()]
});

export const toPath = router.toPath;
