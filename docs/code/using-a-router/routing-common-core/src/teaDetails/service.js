import O from "patchinko/constant";

import { teaMap } from "./data";
import { findRoute } from "../routes";

export const service = ({ state, update }) => {
  const arrive = findRoute(state.route.arrive, "TeaDetails");
  if (arrive) {
    const id = arrive.params.id;
    const description = teaMap[id].description;
    update({ tea: O({ [id]: description }) });
  }

  const leave = findRoute(state.route.leave, "TeaDetails");
  if (leave) {
    const id = leave.params.id;
    update({ tea: O({ [id]: O }) });
  }
};