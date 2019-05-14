import m from "mithril";
import Stream from "mithril/stream";
import O from "patchinko/constant";
import meiosisPatchinko from "meiosis-setup/patchinko";

import { createApp, App } from "./app";
import { router } from "./router";

const app = createApp(router.initialRoute);

meiosisPatchinko({ stream: Stream, O, app }).then(({ states, actions }) => {
  // Only for using Meiosis Tracer in development.
  require("meiosis-tracer")({
    selector: "#tracer",
    rows: 30,
    streams: [
      // { stream: update, label: "update" },
      { stream: states, label: "states" }
    ]
  });

  m.route(document.getElementById("app"), "/", router.MithrilRoutes({ states, actions, App }));

  states.map(() => m.redraw());
  states.map(state => router.locationBarSync(state.route.current));
});
