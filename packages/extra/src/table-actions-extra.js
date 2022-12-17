import TableActions from "table-actions";
import SelectActions from "select-actions";

export class TableActionsExtra extends TableActions {

  constructor(element, options = {}) {
    super(element, options);
  }

  columnSearchInputType(head) {
    const self = this;

    if (!head.searchInputType ||  head.searchInputType == 'input') {
      return self.inputColumnSearch(head);
    } else if (head.searchInputType == 'select') {
      return self.selectInputType(head);
    }

    return;
  }

  selectInputType(head) {
    const self = this;

    const tableHeadRow = self.table.querySelector("tr");
    const tableHeads = tableHeadRow.querySelectorAll("th");
    const allValues = [];

    for (const tr of self.tableRows) {
      for (const [key, th] of tableHeads.entries()) {
        const trCurrent = tr.querySelectorAll("td")[key];
        if (key === 0 && self.options.checkableRows) {
          continue;
        }
        if (th.innerHTML === head.label) {
          allValues.push(trCurrent.innerHTML);
        }
      }
    }

    const selectData = [...new Set(allValues)].map(el => { return { value: el } });

    let select = `<select class="sa-select ta-search-field"></select>`;

    let div = document.createElement("div");
    div.classList = "ta-div-sa";
    div.dataset.label = head.label;
    div.innerHTML = select;

    select = div.querySelector("select.sa-select");
    select.addEventListener("change", function () {
      self.tableSearch(true);
    });

    new SelectActions({
      select,
      minWidth: "100%",
      minWidth: "236.333px",
      selectData: [
        { disabled: true, selected: true, label: "Select a value" },
        ...selectData
      ],
    });

    return div;
  }

}
