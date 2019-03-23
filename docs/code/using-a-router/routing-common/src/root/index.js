import { TaggedUnion, Maybe } from "static-tagged-union";

export const Route = TaggedUnion([
  "Loading",
  "Home",
  "Login",
  "Settings",
  "Tea",
  "TeaDetails",
  "Coffee",
  "Beer",
  "Beverages",
  "Beverage",
  "Brewer"
]);

export const Loaded = Maybe;

export const initRoute = routes => ({
  routes,
  index: 0,
  local: routes[0],
  child: routes[1]
});

export const nextRoute = route => {
  const index = route.index + 1;
  return {
    routes: route.routes,
    index,
    local: route.routes[index],
    child: route.routes[index + 1]
  };
};

export const parentRoute = route =>
  route.routes.slice(0, route.index);

export const childRoute = (route, routeList) =>
  route.routes.concat(routeList);

export const siblingRoute = (route, routeList) =>
  route.routes.slice(0, route.index).concat(routeList);

export const navigateTo = route => ({
  route,
  arriving: true
});

export const root = {
  actions: update => ({
    navigateTo: route => update(navigateTo(route))
  })
};
