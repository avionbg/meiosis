/* global m, O */
const checkIfStateChanged = (next, prev) =>
  next.attrs.state[next.attrs.id] !==
  prev.attrs.state[prev.attrs.id];

const entryNumber = {
  Initial: () => ({
    value: ""
  }),
  Actions: update => ({
    editEntryValue: (id, value) =>
      update({ [id]: O({ value }) })
  })
};

const EntryNumber = {
  onbeforeupdate: checkIfStateChanged,
  view: ({ attrs: { state, id, actions } }) => {
    // eslint-disable-next-line no-console
    console.log("render Entry");

    return m(
      "div",
      m(
        "span",
        { style: { "margin-right": "8px" } },
        "Entry number:"
      ),
      m("input[type=text][size=2]", {
        value: state[id].value,
        oninput: evt =>
          actions.editEntryValue(id, evt.target.value)
      })
    );
  }
};

const entryDate = {
  Initial: () => ({
    value: ""
  }),
  Actions: update => ({
    editDateValue: (id, value) =>
      update({ [id]: O({ value }) })
  })
};

const EntryDate = {
  onbeforeupdate: checkIfStateChanged,
  view: ({ attrs: { state, id, actions } }) => {
    // eslint-disable-next-line no-console
    console.log("render Date");

    return m(
      "div",
      { style: { "margin-top": "8px" } },
      m(
        "span",
        { style: { "margin-right": "8px" } },
        "Date:"
      ),
      m("input[type=text][size=10]", {
        value: state[id].value,
        oninput: evt =>
          actions.editDateValue(id, evt.target.value)
      })
    );
  }
};

const convert = (value, to) =>
  Math.round(
    to === "C"
      ? ((value - 32) / 9) * 5
      : (value * 9) / 5 + 32
  );

const temperature = {
  Initial: label => ({
    label,
    value: 20,
    units: "C"
  }),
  Actions: update => ({
    increment: (id, amount) => evt => {
      evt.preventDefault();
      update({
        [id]: O({ value: O(value => value + amount) })
      });
    },
    changeUnits: id => evt => {
      evt.preventDefault();
      update({
        [id]: O(state => {
          const newUnits = state.units === "C" ? "F" : "C";
          const newValue = convert(state.value, newUnits);
          return O(state, {
            units: newUnits,
            value: newValue
          });
        })
      });
    }
  })
};

const Temperature = {
  onbeforeupdate: checkIfStateChanged,
  view: ({ attrs: { state, id, actions } }) => {
    // eslint-disable-next-line no-console
    console.log("render Temperature", state[id].label);

    return m(
      "div.row",
      { style: { "margin-top": "8px" } },
      m(
        "div.col-md-3",
        m(
          "span",
          state[id].label,
          " Temperature: ",
          state[id].value,
          m.trust("&deg;"),
          state[id].units
        )
      ),
      m(
        "div.col-md-6",
        m(
          "button.btn.btn-sm.btn-default",
          { onclick: actions.increment(id, 1) },
          "Increment"
        ),

        m(
          "button.btn.btn-sm.btn-default",
          { onclick: actions.increment(id, -1) },
          "Decrement"
        ),

        m(
          "button.btn.btn-sm.btn-info",
          { onclick: actions.changeUnits(id) },
          "Change Units"
        )
      )
    );
  }
};

const displayTemperature = temperature =>
  temperature.label +
  ": " +
  temperature.value +
  "\xB0" +
  temperature.units;

const app = {
  Initial: () => ({
    saved: "",
    entry: entryNumber.Initial(),
    date: entryDate.Initial(),
    air: temperature.Initial("Air"),
    water: temperature.Initial("Water")
  }),
  Actions: update =>
    O(
      {
        save: state => evt => {
          evt.preventDefault();
          update({
            saved:
              " Entry #" +
              state.entry.value +
              " on " +
              state.date.value +
              ":" +
              " Temperatures: " +
              displayTemperature(state.air) +
              " " +
              displayTemperature(state.water),

            entry: O({ value: "" }),
            date: O({ value: "" })
          });
        }
      },
      entryNumber.Actions(update),
      entryDate.Actions(update),
      temperature.Actions(update)
    )
};

const App = {
  view: ({ attrs: { state, actions } }) =>
    m(
      "form",
      m(EntryNumber, { state, id: "entry", actions }),
      m(EntryDate, { state, id: "date", actions }),
      m(Temperature, { state, id: "air", actions }),
      m(Temperature, { state, id: "water", actions }),
      m(
        "div",
        m(
          "button.btn.btn-primary",
          { onclick: actions.save(state) },
          "Save"
        ),
        m("span", state.saved)
      )
    )
};

const update = m.stream();
const states = m.stream.scan(O, app.Initial(), update);
const actions = app.Actions(update);

m.mount(document.getElementById("app"), {
  view: () => m(App, { state: states(), actions })
});
