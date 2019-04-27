import React from "react";

import { Route, siblingRoute } from "routing-common/src/routes";
import { toPath } from "../router";

export const Beverages = ({ state, route, beveragesId }) =>
  state[beveragesId] && (
    <ul>
      {state[beveragesId].map(beverage => (
        <li key={beverage.id}>
          <a href={toPath(siblingRoute(route, [Route.Beverage({ id: beverage.id })]))}>
            {beverage.title}
          </a>
        </li>
      ))}
    </ul>
  );
