class TableActions {
  constructor(element, options) {
    this.table =
      typeof element === "string" ? document.querySelector(element) : element;
    this.options = {
      checkableRows: false,
      checkableRowTdReference: "[data-label='uuid']",
      checkedElementsCallBack: function (checkedElements) { console.log(checkedElements) },
      ...options,
    };

    this._init();
  }

  /**
   * Starting table actions
   */
  _init() {
    const self = this,
      tableHeads = this.table.querySelectorAll("[data-sortable]");

    for (const tableHead of tableHeads) {
      tableHead.addEventListener("click", async function (event) {
        self._onClick(event);
      });
    }

    // New table starting sorted by first column
    this._sortTable(0);

    if (this.options.checkableRows) {
      this._checkBoxes();
    }
  }

  /**
   * Events handler
   *
   * @param  {event} event - eventListener event
   */
  _onClick(event) {
    const target = event.target;

    if (target.hasAttribute("data-sortable")) {
      this._sortTable(
        this._getTableHeads()
          .map((x) => x.innerHTML)
          .indexOf(target.innerHTML)
      );
    }
  }

  /**
   * Get array of table header elements
   */
  _getTableHeads() {
    return [...this.table.querySelectorAll("th")];
  }

  /**
   * Convert data for sorting purposes
   *
   * @param  {string} data - Data values to be converted
   * @param  {string} dataType - example "text" - Type of data
   */
  _dataConvert(data, dataType) {
    let result;

    if (!dataType) {
      dataType = /^([0-9]{1,})$/.test(data) ? "number" : "text";
    }

    switch (dataType) {
      // TODO: Consider other formats
      case "date":
        const p = data.split("/");
        result = +(p[2] + p[1] + p[0]);
        break;

      case "date-hour":
        data = data.replace(/\n^\s+/gm, "");
        let date = data.split("/"),
          hour,
          yearHour = date[2].split(" ");
        [date[2], hour] = yearHour;
        hour = hour.split(":");
        result = +(date[2] + date[1] + date[0] + hour[0] + hour[1]);
        break;

      case "number":
        result = +data;
        break;

      case "numeric(15, 2)":
      case "currency-real":
        result = +data.replace(/[\.\,R\$\s]/g, "");
        break;

      default:
        result = data
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        break;
    }

    return result;
  }

  /**
   * Sorting table elements
   *
   * @param  {integer} thIndex - Position of table head element
   */
  _sortTable(thIndex) {
    const self = this,
      rows = this.table.querySelector("tbody"),
      tableHeads = this._getTableHeads(),
      tableHead = tableHeads[thIndex],
      thDs = tableHead.dataset;

    if (!thDs.dir) {
      thDs.dir = "asc";
    }

    const result = [...rows.children].sort(function (a, b) {
      const first = self._dataConvert(a.children[thIndex].innerText, thDs.type);
      const second = self._dataConvert(
        b.children[thIndex].innerText,
        thDs.type
      );

      if (thDs.dir === "asc") {
        if (first < second) {
          return -1;
        }
        if (first > second) {
          return 1;
        }
      } else if (thDs.dir === "desc") {
        if (first > second) {
          return -1;
        }
        if (first < second) {
          return 1;
        }
      }

      return 0;
    });

    // Removing all previous symbol classes from th
    for (const th of tableHeads) {
      th.classList.remove("sorted", "sorted_reverse");
    }

    // Changing tableHead symbol
    if (thDs.dir === "asc") {
      tableHead.classList.add("sorted");
    } else if (thDs.dir === "desc") {
      tableHead.classList.add("sorted_reverse");
    }

    // Change dir value
    thDs.dir = thDs.dir === "asc" ? "desc" : "asc";

    result.forEach((el) => rows.appendChild(el));
  }

  _checkBoxes() {
    // Get class reference to actual table
    const self = this,
      table = this.table;

    function tableCheckboxInsert(elementType) {
      const element = document.createElement(elementType);
      const input = document.createElement("input");
      input.type = "checkbox";
      element.appendChild(input);

      return element;
    }

    // Add table header checkbox
    const tr = table.querySelector("thead>tr");
    tr.prepend(tableCheckboxInsert("th"));

    // Add table rows checkbox
    for (const tr of table.querySelectorAll("tbody>tr")) {
      tr.prepend(tableCheckboxInsert("td"));
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
            checkbox.closest("tr").querySelector(self.options.checkableRowTdReference)
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
        event.target.classList.toggle("checked");
        const parentEl = event.target.closest("tbody, thead");
        const table = event.target.closest("table");

        if (parentEl.nodeName == "THEAD") {
          for (const el of table.querySelectorAll("tbody [type='checkbox']")) {
            el.checked = event.target.checked;
          }
        } else {
          table.querySelector("thead [type='checkbox']").checked = false;
        }
      });
    }
  }
}
