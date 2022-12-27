import Component from "./component.js";

export default class Table extends Component {
  constructor(element, store) {
    super(
      element,
      store
    )
  }

  render () {
    const self = this;
    const state = this.store.getState();

    self.element.innerHTML = `
      <table class="ta ta-sortable ta-responsive-full">
        <thead>
          <tr class="ta__tr-main">
            ${state.headItems[0].items.map(item => {
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
                  ${tr.items.map(td => {
                    return `<td>${td.label}</td>`
                  }).join('')}
                </tr>`
            }).join('')}
        </tbody>
      </table>
    `;

    const table = self.element.querySelector("table");
    const tableClassList = table ? [...table.classList] : [...self.element.classList];
    if(!tableClassList.includes("ta-sortable")) {
      return;
    }

    self.element.querySelectorAll('th').forEach((th, index) => {
      th.addEventListener('click', () => {
        self.store.dispatch({ type:'SORT_COLUMN', payload: { index } });
      });
    });
  }
}

