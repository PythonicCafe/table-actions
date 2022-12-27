import Table from "./components/table.js";
import Store from "./store.js";
import defaultState from "./state.js";
import { mergeObjects } from "./utils.js";

export default class Main {

  constructor(element, params) {
    this.element =
      typeof element === "string" ? document.querySelector(element) : element;

    this.store = new Store(mergeObjects(defaultState, params));
    this.init();
  }

  tableDataExtractor() {
    const self = this;

    const headItems = [{ items: [] }];
    for (const th of [...self.element.querySelectorAll("thead>tr>th")]) {
      const datasets = [];
      for (const [key, val] of Object.entries(th.dataset)) {
        datasets.push({ [key]: val })
      }

      headItems[0].items.push({ label: th.innerHTML, datasets });
    }

    const bodyItems = [];
    for (const tr of [...self.element.querySelectorAll("tbody>tr")]) {
      const trItems = [];
      const datasets = [];

      // Listing tr datasets
      for (const [key, val] of Object.entries(tr.dataset)) {
        datasets.push({ [key]: val })
      }

      // Listing tr tds
      for (const td of [...tr.querySelectorAll("td")]) {
        trItems.push({ label: td.innerHTML, datasets });
      }

      // Pushing results to array
      bodyItems.push({ items: trItems });
    }

    const result = { headItems, bodyItems };

    self.store.dispatch({ type:'POPULATE', payload: { data: result } });
  }

  jsonDataExtractor() {
    const self = this;
    const dataJson = self.store.getState().dataJson;
    const headItems = [{ items: [] }];

    for (const tr of dataJson.head) {
      const head = {};
      for (const [key, val] of Object.entries(tr)) {
        head[key]= val;
      }
      headItems[0].items.push(head);
    }

    const bodyItems = [];
    for (const tr of dataJson.data) {
      const trItems = []
      for (const label of tr) {
        trItems.push({ label });
      }
      bodyItems.push({ items: trItems });
    }

    const result = { headItems, bodyItems };
    self.store.dispatch({ type:'POPULATE', payload: { data: result } });
  }

  init() {
    const self = this;

    if (Object.entries(self.store.getState().dataJson).length === 0) {
      self.tableDataExtractor();
    } else {
      self.jsonDataExtractor();
    }

    // TODO: Other templates type like e-commerce
    const table = new Table(self.element, self.store);
    table.render();
  }
}
