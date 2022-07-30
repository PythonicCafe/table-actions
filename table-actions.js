class TableActions {
  constructor(element, options) {
    this.table =
      typeof element === "string" ? document.querySelector(element) : element;
    this.options = {
      sortable: false,
      checkableRows: false,
      checkableRowTdReference: "[data-ref]",
      checkedElementsCallBack: function (checkedElements) {
        console.log(checkedElements);
      },
      ...options,
    };

    this._init();
  }

  _init() {
    const checkableRows = this.options.checkableRows;
    if (checkableRows) this._setTableCheckBoxes();
    if (this.options.sortable) this._setTableSort(checkableRows);
  }

  _setTableSort(checkableRows) {
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
        self._sortTable(th, thIndex, otherTh);
      });
    }
  }

  _sortDataFormat(format, value, nextValue) {
    switch (format) {
      case "DD/MM/YYYY":
        value = value.split("/");
        value = new Date(value[2] + "-" + value[1] + "-" + value[0]);
        nextValue = nextValue.split("/");
        nextValue = new Date(
          nextValue[2] + "-" + nextValue[1] + "-" + nextValue[0]
        );
        break;

      case "YYYY/MM/DD":
        value = new Date(value.replace("/", "-"));
        nextValue = new Date(nextValue.replace("/", "-"));

      case "YYYY-MM-DD":
        value = new Date(value);
        nextValue = new Date(nextValue);
        break;

      case "YYYY-MM-DD HH:MM:SS":
        const [valueDate, valueHour] = value.split(" ");
        value = new Date(valueDate + "T" + valueHour);
        const [nextValueDate, nextValueHour] = value.split(" ");
        value = new Date(nextValueDate + "T" + nextValueHour);
        break;

      default:
        throw new Error(`Format ${format} not recognized`);
        break;
    }

    return [value, nextValue];
  }

  _sortTable(th, thIndex, otherThs) {
    const self = this;
    const tbody = this.table.querySelector("tbody");
    const rows = tbody.getElementsByTagName("tr");

    for (const otherTh of otherThs) {
      otherTh.removeAttribute("data-asc");
    }

    th.dataset.asc = th.dataset.asc ? !JSON.parse(th.dataset.asc) : true;

    const format = th.dataset.format;

    let unsorted = true;
    while (unsorted) {
      unsorted = false;

      for (let r = 0; r < rows.length - 1; r++) {
        const row = rows[r];
        const nextRow = rows[r + 1];
        let value = row.querySelectorAll("td")[thIndex].innerHTML;
        let nextValue = nextRow.querySelectorAll("td")[thIndex].innerHTML;

        if (format) {
          [value, nextValue] = self._sortDataFormat(format, value, nextValue);
        } else {
          const regex = /[\ \,\;\n]/g;

          value = value.replace(regex, "").toLowerCase();
          nextValue = nextValue.replace(regex, "").toLowerCase();
          if (!isNaN(value)) {
            value = parseFloat(value);
            nextValue = parseFloat(nextValue);
          }
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

  _setTableCheckBoxes() {
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
          checked.push(
            checkbox
              .closest("tr")
              .querySelector(self.options.checkableRowTdReference).dataset.ref
          );
        }
      }

      self.options.checkedElementsCallBack(checked);
    });

    // Table checkboxes logic, check all and check one by one
    var checkboxes = document.querySelectorAll("[type='checkbox']");

    for (const checkbox of checkboxes) {
      checkbox.addEventListener("click", function (event) {
        const thead = event.target.closest("thead");

        if (thead) {
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
