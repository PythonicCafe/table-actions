import Table from "./components/table.js";
import Store from "./store.js";
import defaultState from "./state.js";
import { mergeObjects } from "./utils.js";

export default class Main {

  constructor(element, params) {
    this.element =
      typeof this.element === "string" ? document.querySelector(element) : element;

    this.store = new Store(mergeObjects(defaultState, params));

    this.init();
  }

  init() {
    const self = this;

    // TODO: Other templates type like e-commerce
    const table = new Table(self.element, self.store);
    table.render();
  }
}
