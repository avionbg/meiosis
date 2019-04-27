import React from "react";

import { parentRoute } from "routing-common/src/routes";
import { toPath } from "../router";

export const TeaDetails = ({ state, route }) => (
  <div>
    <div>{state.tea[route.local.params.id]}</div>
    <a href={toPath(parentRoute(route))}>Back to list</a>
  </div>
);
