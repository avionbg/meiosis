import React from "react";

export const TeaDetails = ({ state, actions, routing }) => (
  <div>
    <div>{state.tea[routing.localSegment.params.id]}</div>
    <a href="javascript://" onClick={() => actions.navigateTo(routing.parentRoute())}>
      Back to list
    </a>
  </div>
);
