import { run } from "stags";

import { router } from "../router";
import { Data } from "../util";

export const Beverages = ({ state, list, beverageRoute }) =>
  run(
    state[list],
    Data.getLoadedWith(null, beverages => [
      ".row",
      [
        ".col-md-6",
        beverages.map(beverage => [
          "div",
          { key: beverage.id },
          ["a", { href: router.toPath(beverageRoute({ id: beverage.id })) }, beverage.title]
        ])
      ]
    ])
  );
