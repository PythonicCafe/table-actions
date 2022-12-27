export default class Component {
  constructor(element, store) {
    const self = this;
    this.element = element;
    // Component subscribed to store pubSub
    store.pubSub.subscribe("stateUpdate", function () { self.render() });
    this.store = store;
  }
}
