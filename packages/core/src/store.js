import Pubsub from "./pubsub.js";
import reducer from "./reducer.js";

/**
 * Store a central store which has a private state and exposes a dispatch()
 * and a getState() function. To mutate the state , we dispatch() actions,
 * which call the main reducer() to produce the next state depending on the
 * actual value and the action being dispatched.
 */
export default class Store {
  constructor(initialState) {
    const self = this;
    this.pubSub = new Pubsub();

    this.state = new Proxy(
      { value: initialState },
      {
        set(obj, prop, value) {
          obj[prop] = value;
          self.pubSub.publish("stateUpdate", self.getState());
          return true;
        }
      }
    );
  }

  /**
   * Get actual state
   */
  getState() {
    return { ...this.state.value };
  }

  /**
   * Dispatch actions witch call reducer() to produce the next state
   *
   * @param {Object} action name to be executed and payload with some data
   */
  dispatch(action) {
    const prevState = this.getState();
    this.state.value = reducer(prevState, action);
  }
}
