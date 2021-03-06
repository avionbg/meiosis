/* global MeiosisRouting */

const { createRouteSegments } = MeiosisRouting.state;

export const Route = createRouteSegments([
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

export const navTo = route => ({
  route: Array.isArray(route) ? route : [route]
});
