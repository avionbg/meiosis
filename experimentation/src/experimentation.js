// Meiosis

import flyd from "flyd";
import m from "mithril";
import * as R from "ramda";
import objectPath from "object-path";
import meiosisTracer from "meiosis-tracer";

const meiosis = initialModel => {
  const nestComponent = (component, path) => ({
    receive: component.receive && ((model, proposal) => {
      component.receive(objectPath.get(model, path), proposal);
      return model;
    }),
    nextAction: component.nextAction && ((model, proposal) => {
      const subModel = objectPath.get(model, path);

      if (subModel) {
        component.nextAction(subModel, proposal);
      }
    }),
    state: component.state && ((model, state) => {
      const subModel = objectPath.get(state, path);

      if (subModel) {
        objectPath.set(state, path, component.state(objectPath.get(model, path), subModel));
      }
      return state;
    }),
    initialModel: component.initialModel
  });

  const getComponentFunctions = property => components =>
    components.map(R.prop(property)).filter(R.identity);

  const propose = flyd.stream();
  const components = flyd.stream([]);

  const receives = flyd.map(getComponentFunctions("receive"), components);
  const receive = flyd.map(fns => (model, proposal) =>
    fns.reduce((model, fn) => fn(model, proposal), model), receives);

  const model = flyd.scan((model, proposal) => receive()(model, proposal), initialModel, propose);

  const states = flyd.map(getComponentFunctions("state"), components);
  const stateFn = flyd.map(fns => model =>
    fns.reduce((state, fn) => fn(model, state), JSON.parse(JSON.stringify(model))), states);

  const state = flyd.combine((model, stateFn) => stateFn()(model()), [model, stateFn]);

  const nexts = flyd.map(getComponentFunctions("nextAction"), components);
  const nextAction = flyd.map(fns => (model, proposal) =>
    fns.forEach(fn => fn(model, proposal)), nexts);

  flyd.on(model => propose() && nextAction()(model, propose()), model);

  return {
    propose,
    components,
    model,
    stateFn,
    state,
    nestComponent
  };
};

// Util

const pipeIn = function() {
  return R.pipe.apply(R, Array.prototype.slice.call(arguments, 1))(arguments[0]);
};

// Counter

const counterComponent = (propose, id) => {
  const initialModel = { counter: 0 };

  const receive = (model, proposal) => {
    if (proposal.counterId === id && proposal.add) {
      model.counter += proposal.add;
    }
    return model;
  };

  const state = (model, state) => {
    state.even = model.counter % 2 === 0;
    return state;
  };

  const nextAction = (model, proposal) => {
    if (proposal.counterId === id && model.counter === 5) {
      propose({ counterId: id, add: 2 });
    }
  };

  return { initialModel, receive, state, nextAction };
};

const counterView = ({propose, id, remove, model}) => {
  const events = ({
    onIncrease: _evt => propose({ counterId: id, add:  1 }),
    onDecrease: _evt => propose({ counterId: id, add: -1 }),
    onRemove: _evt => propose({ counterId: id, removeCounter: true })
  });

  return m("div",
    m("span", "Counter: " + model.counter + " " + (model.even ? "Even" : "Odd")),
    m("button.btn.btn-sm.btn-primary", { onclick: events.onIncrease }, "Increase"),
    m("button.btn.btn-sm.btn-default", { onclick: events.onDecrease }, "Decrease"),
    remove ? m("button.btn.btn-sm.btn-danger", { onclick: events.onRemove }, "Remove") : null);
};

const initialModel = { counter: 0, counterIds: [], countersById: {} };
const { propose, components, stateFn, state, nestComponent } = meiosis(initialModel);

const componentsById = {};

const id = "counter_" + String(new Date().getTime());
const topCounter = counterComponent(propose, id);

const events = propose => ({
  onAddCounter: _evt => propose({ addCounter: true })
});

const createView = events => model => m("div",
  counterView({ propose, id, remove: false, model }),
  m("button.btn.btn-primary", { onclick: events.onAddCounter }, "Add Counter"),
  model.counterIds.map(id => counterView({ propose, id, remove: true, model: model.countersById[id] })));

const view = pipeIn(propose, events, createView);

const counterContainer = {
  receive: (model, proposal) => {
    if (proposal.addCounter) {
      const id = "counter_" + String(new Date().getTime());
      const counter = nestComponent(counterComponent(propose, id), "countersById." + id);
      model.countersById[id] = counter.initialModel;
      model.counterIds.push(id);
      componentsById[id] = counter;
      components(componentList.concat(R.values(componentsById)));
    }
    else if (proposal.removeCounter) {
      const id = proposal.counterId;
      delete componentsById[id];
      delete model.countersById[id];
      model.counterIds.splice(model.counterIds.indexOf(id), 1);
      components(componentList.concat(R.values(componentsById)));
    }
    return model;
  }
};

const componentList = [topCounter, counterContainer];
components(componentList);

const element = document.getElementById("app");
const render = state => m.render(element, view(state));
flyd.on(render, state);

const createComponent = component => {
  componentList.push(component);
  components(componentList);
};
render.initialModel = initialModel;
render.state = model => stateFn()(model);

meiosisTracer(createComponent, render, "#tracer");