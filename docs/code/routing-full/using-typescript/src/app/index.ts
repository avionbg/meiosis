import { Route, routes, navigateTo } from "../routes";
import { tea } from "../tea";
import { teaDetails } from "../teaDetails";

export const createApp = (initialRoute): any => ({
  patch: navigateTo(initialRoute || Route.Home()),

  Actions: (update): any => Object.assign({}, routes.Actions(update)),

  services: [routes.service, tea.service, teaDetails.service]
});
