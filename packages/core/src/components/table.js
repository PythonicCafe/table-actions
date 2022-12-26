export default class Table {
  constructor(element, store) {
    const self = this;
    this.element =
      typeof element === "string" ? document.querySelector(element) : element;

    // Component subscribed to store pubSub
    store.pubSub.subscribe("stateUpdate", function () { self.render() });

    this.store = store;
  }


  render () {
    const self = this;
    const state = this.store.getState();

    self.element.innerHTML = `
      <table class="ta ta-sortable ta-responsive-full">
        <thead>
          <tr class="ta__tr-main">
            ${state.headItems.map(item => {
              return `
                <th data-asc=${item.asc === undefined ? '' : item.asc}>${item.label}</th>
              `
            }).join('')}
          </tr>
        </thead>
        <tbody>
            ${state.bodyItems.map(tr => {
              return `
                <tr>
                  ${tr.map(td => {
                    return `<td>${td.label}</td>`
                  }).join('')}
                </tr>`
            }).join('')}
        </tbody>
      </table>
    `;

    self.element.querySelectorAll('th').forEach((th, index) => {
      th.addEventListener('click', () => {
        self.store.dispatch({ type:'SORT_COLUMN', payload: { index } });
      });
    });
  }
}

