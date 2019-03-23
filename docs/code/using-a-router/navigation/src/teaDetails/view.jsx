import React from "react";

import { parentRoute } from "routing-common/src/root";

export const TeaDetails = ({ state, actions, route }) => (
  <div>
    <div>{state.tea}</div>
    <a href="javascript://"
      onClick={() => actions.navigateTo(parentRoute(route))}
    >Back to list</a>
  </div>
);
