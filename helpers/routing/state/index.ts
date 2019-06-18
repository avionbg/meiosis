/**
 * `meiosis-routing/state`
 * @module state
 */

/**
 * A route segment.
 */
export interface RouteSegment {
  id: string;
  params: Record<string, any>;
}

export type RouteParamFn = (params: Record<string, object> | null) => RouteSegment;

/**
 * A Route is an array of route segments.
 */
export type Route = RouteSegment[];

/**
 * The route state.
 */
export interface RouteState {
  previous: Route;
  current: Route;
}

/**
 * The route transition indicates the [[Route]] that the user is leaving and to which they are
 * arriving.
 */
export interface RouteTransition extends RouteState {
  leave: Route;
  arrive: Route;
}

export interface RoutingObject {
  route: Route;
  index: number;
  localSegment: RouteSegment;
  childSegment: RouteSegment;
  next: () => RoutingObject;
  parentRoute: () => Route;
  childRoute: (child: Route) => Route;
  siblingRoute: (sibling: Route) => Route;
}

/**
 * A routing is an object with navigation methods.
 *
 * @typedef {Object} routing
 *
 * @property {RouteSegment} localSegment
 * @property {RouteSegment} childSegment
 * @property {function():routing} next returns the next routing instance
 * @property {function():route} parentRoute returns the parent route
 * @property {function(route):route} childRoute returns a child route
 * @property {function(route):route} siblingRoute returns a sibling route
 *
 * @example
 *
 * href={routing.parentRoute()}
 *
 * routing.childRoute(Route.Child());
 * routing.childRoute([Route.User(), Route.Details()];
 */

// fastDeepEqual credit: https://github.com/epoberezkin/fast-deep-equal
// This version does not handle Date and RegExp, because we shouldn't have those types when
// parsing a URL string.
const isArray = Array.isArray;
const keyList = Object.keys;
const hasProp = Object.prototype.hasOwnProperty;

const fastDeepEqual = (a, b): boolean => {
  if (a === b) return true;

  if (a && b && typeof a == "object" && typeof b == "object") {
    const arrA = isArray(a),
      arrB = isArray(b);

    let i, length, key;

    if (arrA && arrB) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) if (!fastDeepEqual(a[i], b[i])) return false;
      return true;
    }

    if (arrA != arrB) return false;

    const keys = keyList(a);
    length = keys.length;

    if (length !== keyList(b).length) return false;

    for (i = length; i-- !== 0; ) if (!hasProp.call(b, keys[i])) return false;

    for (i = length; i-- !== 0; ) {
      key = keys[i];
      if (!fastDeepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return a !== a && b !== b;
};

const defaultEmpty = (route: Route | null): Route => (Array.isArray(route) ? route : []);

/**
 * Creates a `Route` helper with functions to create route segments.
 * @param {Array<string>} routeNames - the list of route names.
 * @returns {Constructor<RouteSegment>} - the `Route` with constructor functions.
 *
 * @example
 *
 * const Route = createRouteSegments(["Home", "User"]);
 *
 * Route.Home()
 * // { id: "Home", params: {} }
 *
 * Route.User({ name: "duck" })
 * // { id: "User", params: { name: "duck" } }
 */
export function createRouteSegments(routeNames: string[]): Record<string, RouteParamFn> {
  return routeNames.reduce((result, id): Record<string, RouteParamFn> => {
    result[id] = (params: Record<string, any>): RouteSegment => ({
      id,
      params: params == null ? {} : params
    });
    return result;
  }, {});
}

/**
 * Looks for a route segment, with matching params, in a route.
 * @param {Route} route
 * @param {RouteSegment} routeSegmentWithParams
 * @returns {RouteSegment} - the matching Route segment, or `undefined` if `route` is empty or the
 * Route segment was not found.
 */
export function findRouteSegmentWithParams(
  route: Route,
  routeSegmentWithParams: RouteSegment
): RouteSegment | undefined {
  return defaultEmpty(route).find(
    (routeSegment: RouteSegment): boolean =>
      routeSegment.id === routeSegmentWithParams.id &&
      fastDeepEqual(routeSegment.params, routeSegmentWithParams.params)
  );
}

/**
 * Looks for a Route segment, regardless of the params, in a route.
 * @param {Route} route
 * @param {string} id
 * @returns {RouteSegment} - the matching Route segment, or `undefined` if `route` is empty or a
 * route segment with the given id was not found.
 */
export function findRouteSegment(route: Route, id: RouteSegment): RouteSegment | undefined {
  const findId = id.id || id;
  return defaultEmpty(route).find((routeSegment): boolean => routeSegment.id === findId);
}

export function diffRoute(from: Route, to: Route): Route {
  const init: Route = [];

  return defaultEmpty(from).reduce(
    (result, route): Route =>
      result.concat(findRouteSegmentWithParams(to, route) === undefined ? route : []),
    init
  );
}

/**
 * Calculates route transitions, providing `leave` and `arrive` to indicate the route segments for
 * the route that we are leaving, and the route to which we are arriving, respectively.
 * @param {Object} state the route state
 * @returns {Object} an object with `previous`, `current`, `leave`, and `arrive` properties.
 */
export function routeTransition(routeState: RouteState): RouteTransition {
  const { previous, current } = routeState;

  return {
    previous: current,
    current: current,
    leave: diffRoute(previous, current),
    arrive: diffRoute(current, previous)
  };
}

/**
 * `function whenPresent(value, fn): any`
 *
 * Calls a function with a value only if the value is not `null` or `undefined`.
 * @param {*} value the value to check
 * @param {function(value)} fn the function to call if `value` is present
 * @returns {*} - the result of calling `fn(value)`, or `null` if `value` is absent.
 */
export function whenPresent(value: any, fn: (x: any) => any): any {
  return value != null ? fn(value) : null;
}

/**
 * @constructor Routing
 *
 * @param {Route} route
 * @param {number} index
 *
 * @returns {routing} - a routing object
 */
export function Routing(route: Route = [], index = 0): RoutingObject {
  return {
    route,
    index,
    localSegment: route[index] || {},
    childSegment: route[index + 1] || {},
    next: (): RoutingObject => Routing(route, index + 1),
    parentRoute: (): Route => route.slice(0, index),
    childRoute: (child: Route): Route => route.slice(0, index + 1).concat(child),
    siblingRoute: (sibling: Route): Route => route.slice(0, index).concat(sibling)
  };
}