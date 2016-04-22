/*
Adapters =
  { render : html => void
  , wire : send, receive
  }
Config =
  { initialModel : model
  , update : (model, action) => model
  , actions : next => Object
  , view : ({model, actions}) => html
  , chain : (model, action, actions) => <next action> void
  }

Feature =
  { view : props => html
  }
*/
import { assoc, merge } from "ramda"; // FIXME: adapter

let wires = {};
let nextWireId = 1;
const createWire = () => {
  let receiver = null;
  const receive = rcv => receiver = rcv;
  const send = data => receiver(data);

  return { send, receive };
};
const defaultWire = wireName => {
  let name = wireName;
  if (!name) {
    name = "wire_" + nextWireId;
    nextWireId++;
  }
  let theWire = wires[name];
  if (!theWire) {
    theWire = createWire();
    wires[name] = theWire;
  }
  return theWire;
};

const meiosis = adapters => {
  const wire = adapters.wire || defaultWire;
  const rootWire = wire("meiosis");
  let rootModel = {};

  const createComponent = config => {
    if (!config || !config.view) {
      throw new Error("At a minimum, you need to specify a view to create a component.");
    }
    rootModel = merge(rootModel, config.initialModel || {});

    const componentWire = wire();
    const next = componentWire.send;
    const nextAction = {next};
    const actions = config.actions ? merge(nextAction, config.actions(next)) : nextAction;

    componentWire.receive(action => {
      if (config.update) {
        const model = config.update(rootModel, action);
        rootWire.send(model);

        if (config.chain) {
          config.chain(model, action, actions);
        }
      }
    });

    return props => config.view(assoc("actions", actions, props));
  };

  const run = root => {
    rootWire.receive(model => {
      rootModel = merge(rootModel, model); // add multiple functions, default merge, also logging or time travel
      adapters.render(root({model: rootModel}));
    });

    rootWire.send(rootModel);
  };

  return { createComponent, run };
};

export { meiosis };