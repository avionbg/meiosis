import { Either, bifold, run } from "stags";

import { login } from "../login";
import { settings } from "../settings";
import { Route, otherRoutes } from "../routes";
import { K } from "../util";
/*
import { tea } from "../tea";
import { teaDetails } from "../teaDetails";
import { coffee } from "../coffee";
import { beer } from "../beer";
import { beverage } from "../beverage";
import { brewer } from "../brewer";
*/

const { Y, N, fromNullable } = Either;

export const createApp = initialRoute => ({
  initial: { route: initialRoute },

  Actions: update => Object.assign({}, login.Actions(update), settings.Actions(update)),

  validate: getState => patch =>
    run(
      fromNullable(patch.route),
      bifold(
        K(Y(patch)),
        Route.fold({
          ...otherRoutes(K(Y(patch))),
          Settings: () =>
            getState().user
              ? Y(patch)
              : Y({
                  route: Route.of.Login(),
                  login: {
                    message: "Please login.",
                    returnTo: Route.of.Settings()
                  }
                }),
          Tea: N,
          Coffee: N
        })
      )
    ),

  onRouteChange: getState =>
    Either.map(change =>
      Object.assign(
        change,
        run(
          change.route,
          Route.fold(
            Object.assign(otherRoutes(() => (getState().login ? { login: undefined } : null)), {
              Login: () =>
                !getState().login
                  ? { login: Object.assign({ username: "", password: "" }, change.login) }
                  : null
            })
          )
        )
      )
    )

  /*
  routeChange: [login.routeChange],

  services: [
    routes.service,
    settings.service,
    login.service,
    tea.service,
    teaDetails.service,
    coffee.service,
    beer.service,
    beverage.service,
    brewer.service
  ]
  */
});

export { App } from "./view";