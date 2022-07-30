class TableActions {
  constructor(element, options) {
    this.table =
      typeof element === "string" ? document.querySelector(element) : element;
    this.options = {
      sortable: false,
      checkableRows: false,
      checkableRowTdReference: "[data-label='ref']",
      checkedElementsCallBack: function (checkedElements) {
        console.log(checkedElements);
      },
      ...options,
    };

    this._init();
  }

  _init() {
    const checkableRows = this.options.checkableRows;
    if (checkableRows) this._checkBoxes();
    if (this.options.sortable) this._setSortable(checkableRows);
  }

  _setSortable(checkableRows) {
    const self = this;

    // Setting class to activate table arrows styles
    this.table.classList.add("sortable");

    const tableHeads = this.table.querySelectorAll("th");
    for (
      let thIndex = checkableRows ? 1 : 0;
      thIndex < tableHeads.length;
      thIndex++
    ) {
      const th = tableHeads[thIndex];
      const otherTh = [];

      for (const [index, el] of tableHeads.entries()) {
        if (index !== thIndex) otherTh.push(el);
      }

      th.addEventListener("click", function () {
        self._sortable(th, thIndex, otherTh);
      });
    }
  }

  _sortable(th, thIndex, otherThs) {
    const tbody = this.table.querySelector("tbody");
    const rows = tbody.getElementsByTagName("tr");

    for (const otherTh of otherThs) {
      otherTh.removeAttribute("data-asc");
    }

    th.dataset.asc = th.dataset.asc ? !JSON.parse(th.dataset.asc) : true;

    let unsorted = true;
    while (unsorted) {
      unsorted = false;

      for (let r = 0; r < rows.length - 1; r++) {
        const row = rows[r];
        const nextRow = rows[r + 1];
        let value = row.querySelectorAll("td")[thIndex].innerHTML;
        let nextValue = nextRow.querySelectorAll("td")[thIndex].innerHTML;

        // TODO: Check if user set type date and order by the date format
        const regex = /[\ \,\;]/g;

        value = value.replace(regex, "");
        nextValue = nextValue.replace(regex, "");
        if (!isNaN(value)) {
          value = parseFloat(value);
          nextValue = parseFloat(nextValue);
        }

        if (
          JSON.parse(th.dataset.asc) ? value > nextValue : value < nextValue
        ) {
          tbody.insertBefore(nextRow, row);
          unsorted = true;
        }
      }
    }
  }

  _checkBoxes() {
    // Get class reference to actual table
    const self = this,
      table = this.table;

    function tableCheckboxInsert(elementType, classes = []) {
      const element = document.createElement(elementType);
      const input = document.createElement("input");

      if (classes.length) {
        element.classList.add(...classes);
      }

      input.type = "checkbox";
      element.appendChild(input);

      return element;
    }

    // Add table header checkbox
    const tr = table.querySelector("thead>tr");
    tr.prepend(tableCheckboxInsert("th", ["tb-checkbox-column"]));

    // Add table rows checkbox
    for (const tr of table.querySelectorAll("tbody>tr")) {
      tr.prepend(tableCheckboxInsert("td", ["tb-checkbox-row"]));
    }

    // Set interaction button
    const button = document.createElement("button");
    button.id = "interact";
    button.classList = "btn";
    button.innerHTML = "Interact";
    table.parentNode.appendChild(button);

    // Click button show all element selected
    button.addEventListener("click", function (event) {
      const checked = [];
      for (const checkbox of table.querySelectorAll(
        "tbody [type='checkbox']"
      )) {
        if (checkbox.checked == true) {
          // TODO: Better reference to get id uuid value
          checked.push(
            checkbox
              .closest("tr")
              .querySelector(self.options.checkableRowTdReference)
              .innerHTML.trim()
          );
        }
      }

      self.options.checkedElementsCallBack(checked);
    });

    // Table checkboxes logic, check all and check one by one
    var checkboxes = document.querySelectorAll("[type='checkbox']");

    for (const checkbox of checkboxes) {
      checkbox.addEventListener("click", function (event) {
        const parentEl = event.target.closest("tbody, thead");
        const table = event.target.closest("table");

        if (parentEl.nodeName == "THEAD") {
          for (const el of table.querySelectorAll("tbody [type='checkbox']")) {
            el.checked = event.target.checked;
            el.checked
              ? el.closest("tr").classList.add("checked")
              : el.closest("tr").classList.remove("checked");
          }
        } else {
          table.querySelector("thead [type='checkbox']").checked = false;
          event.target.closest("tr").classList.toggle("checked");
        }
      });
    }
  }
}
