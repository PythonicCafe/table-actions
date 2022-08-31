/*
 * TODO: Separete external functions in an external file
 * utils.js and import here
 */
function toNormalForm(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function newElement(element, id, classList = [], label, nodeToAppend) {
  const el = document.createElement(element);
  el.id = id;
  el.classList.add(...classList);
  el.innerHTML = label;
  return nodeToAppend.appendChild(el);
}

class TableActions {
  constructor(element, options) {
    this.table =
      typeof element === "string" ? document.querySelector(element) : element;

    this.tableContainer = this.table.parentNode.parentNode;

    this.tableRows = [
      ...this.table.querySelector("tbody").querySelectorAll("tr"),
    ];

    this.currentPage = 1;

    this.options = {
      sortable: options.sortable ?? false,
      paginable: options.paginable ?? undefined,
      rowsPerPage: options.rowsPerPage ?? 10,
      checkableRows: options.checkableRows ?? false,
      checkableRowTdReference: options.checkableRowTdReference ?? "[data-ref]",
      checkedElementsCallback:
        options.checkedElementsCallback ??
        function (checkedElements) {
          console.log(checkedElements);
        },
    };

    this._init();
  }

  _init() {
    const checkableRows = this.options.checkableRows;

    // Set bottom-div to add buttons
    newElement("div", "bottom-div", ["ta-bottom-div"], "", this.tableContainer);

    if (checkableRows) this._setTableCheckBoxes();
    if (this.options.sortable) this._setTableSort(checkableRows);

    if (this.options.paginable && this._lastPage() > 1) {
      this._setPaginationButtons();
      this._updateTable();
    }
  }

  // Setters

  _setPaginationButtons() {
    const self = this;

    const bottomDiv = self.tableContainer.querySelector("#bottom-div");

    newElement(
      "button",
      "back-all-pages",
      ["ta-btn", "ta-btn-pag-jump"],
      "&lt;&lt;",
      bottomDiv
    ).addEventListener("click", function () {
      if (self.currentPage > 1) {
        self.currentPage = 1;
        self._updateTable();
      }
    });
  
    newElement(
      "button",
      "back-page",
      ["ta-btn", "ta-btn-pag"],
      "&lt;",
      bottomDiv
    ).addEventListener("click", function () {
      if (self.currentPage > 1) {
        self.currentPage = self.currentPage -= 1;
        self._updateTable();
      }
    });

    if(this.options.paginable === "numbered-list") {
      newElement("div", "numbered-buttons", [], "", bottomDiv);
    } else if(this.options.paginable === "buttons-only"){
      newElement("div", "paginable-pages", [], "", bottomDiv);
    }

    newElement(
      "button",
      "forward-page",
      ["ta-btn", "ta-btn-pag"],
      "&gt;",
      bottomDiv
    ).addEventListener("click", function () {
      if (self.currentPage < self._lastPage()) {
        self.currentPage = self.currentPage += 1;
        self._updateTable();
      }
    });

    newElement(
      "button",
      "forward-all-pages",
      ["ta-btn", "ta-btn-pag-jump"],
      "&gt;&gt;",
      bottomDiv
    ).addEventListener("click", function () {
      if (self.currentPage < self._lastPage()) {
        self.currentPage = self._lastPage();
        self._updateTable();
      }
    });
  }

  _setButtonsOnlyPagination() {
    const self = this;
    const div = self.tableContainer.querySelector("#paginable-pages");
    div.innerHTML = `${this.currentPage} - ${this._lastPage()}`;
  }

  _setNumberedListPagination() {
    const self = this;
    const lastPage = this._lastPage();
    const currentPage = this.currentPage;

    const div = self.tableContainer.querySelector("#numbered-buttons");
    div.innerHTML = "";

    for (let i = 0; i < lastPage; i++) {
      const pageNumber = i + 1;
      const backwardAndNextTwoTimes = [currentPage - 2, currentPage + 2];
      const backwardAndNext = [
        currentPage - 1,
        currentPage + 1,
        ...backwardAndNextTwoTimes,
      ];
      const pagesOfMiddle = pageNumber > 4 && pageNumber < lastPage - 1;

      let label = pageNumber;

      if (lastPage > 8) {
        if (
          pagesOfMiddle &&
          pageNumber !== currentPage &&
          !backwardAndNext.includes(pageNumber)
        ) {
          continue;
        }
        if (
          [...backwardAndNextTwoTimes, currentPage + 3].includes(pageNumber) &&
          pageNumber > 3 &&
          pageNumber < lastPage - 1
        ) {
          label = "...";
        }
      }

      newElement(
        "button",
        `page-${pageNumber}`,
        ["ta-btn", "ta-btn-pag-numbered"],
        label,
        self.tableContainer.querySelector("#numbered-buttons")
      ).addEventListener("click", function () {
        self.currentPage = pageNumber;
        self._updateTable();
      });
    }
  }

  _setTableCheckBoxes() {
    // Get class reference to actual table
    const self = this;

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
    const tr = self.table.querySelector("thead>tr");
    tr.prepend(tableCheckboxInsert("th", ["ta-checkbox-column"]));

    // Add table rows checkbox
    for (const tr of self.table.querySelectorAll("tbody>tr")) {
      tr.prepend(tableCheckboxInsert("td", ["ta-checkbox-row"]));
    }

    // Set interaction button
    const button = newElement(
      "button",
      "interact",
      ["ta-btn"],
      "Interact",
      self.tableContainer.querySelector("#bottom-div")
    );

    // Click button show all element selected
    button.addEventListener("click", async function () {
      const checked = [];
      for (const row of self.tableRows) {
        if (row.querySelector("[type='checkbox']").checked) {
          checked.push(
            row.querySelector(self.options.checkableRowTdReference).dataset.ref
          );
        }
      }

      await self.options.checkedElementsCallback(checked);
    });

    // Table checkboxes logic, check all and check one by one
    var checkboxes = document.querySelectorAll("[type='checkbox']");

    for (const checkbox of checkboxes) {
      checkbox.addEventListener("click", function (event) {
        const thead = event.target.closest("thead");

        if (thead) {
          for (const el of self.tableRows) {
            const checkbox = el.querySelector("[type='checkbox']");
            if (event.target.checked) {
              checkbox.checked = true;
              checkbox.closest("tr").classList.add("checked");
            } else {
              checkbox.checked = false;
              checkbox.closest("tr").classList.remove("checked");
            }
          }
        } else {
          self.table.querySelector("thead [type='checkbox']").checked = false;
          event.target.closest("tr").classList.toggle("checked");
        }
      });
    }
  }

  _setTableSort(checkableRows) {
    const self = this;

    // Setting class to activate table arrows styles
    this.table.classList.add("sortable");

    const tableHeads = this.table.querySelectorAll("th");
    for (
      let thIndex = checkableRows ? 1 : 0; // if checkable column jump first
      thIndex < tableHeads.length;
      thIndex++
    ) {
      const th = tableHeads[thIndex];
      const otherTh = [];

      // Getting other columns to remove active icons class colors
      for (const [index, el] of tableHeads.entries()) {
        if (index !== thIndex) otherTh.push(el);
      }

      // Setting events listeners to get click in table headers.
      // Clicks will activate sort to the clicked column
      th.addEventListener("click", function () {
        self._sortTable(th, thIndex, otherTh);
      });
    }
  }

  _sortDataFormat(format, val, nextVal) {
    switch (format) {
      case "DD/MM/YYYY":
        val = val.split("/");
        val = new Date(val[2] + "-" + val[1] + "-" + val[0]);
        nextVal = nextVal.split("/");
        nextVal = new Date(nextVal[2] + "-" + nextVal[1] + "-" + nextVal[0]);
        break;

      case "YYYY/MM/DD":
        val = new Date(val.replace("/", "-"));
        nextVal = new Date(nextVal.replace("/", "-"));
        break;

      case "YYYY-MM-DD":
        val = new Date(val);
        nextVal = new Date(nextVal);
        break;

      case "YYYY-MM-DD HH:MM:SS":
        val = new Date(val.split(" ")[0] + "T" + val.split(" ")[1]);
        nextVal = new Date(nextVal.split(" ")[0] + "T" + nextVal.split(" ")[1]);
        break;

      default:
        throw new Error(`Format ${format} not recognized`);
      // break;
    }

    return [val, nextVal];
  }

  _sortTable(th, thIndex, otherThs) {
    const self = this;
    const asc = th.dataset.asc ? !JSON.parse(th.dataset.asc) : true;
    const format = th.dataset.format;

    for (const otherTh of otherThs) {
      otherTh.removeAttribute("data-asc");
    }

    self.tableRows.sort(function (val, nextVal) {
      val = val.querySelectorAll("td")[thIndex].innerHTML;
      nextVal = nextVal.querySelectorAll("td")[thIndex].innerHTML;

      if (format) {
        [val, nextVal] = self._sortDataFormat(format, val, nextVal);
      } else {
        const regex = /[ ,;\n]/g;

        val = val.replace(regex, "").toLowerCase();
        nextVal = nextVal.replace(regex, "").toLowerCase();

        if (!isNaN(val)) {
          val = parseFloat(val);
          nextVal = parseFloat(nextVal);
        } else {
          val = toNormalForm(val);
          nextVal = toNormalForm(nextVal);
        }
      }

      if ((asc && val > nextVal) || (!asc && val < nextVal)) {
        return 1;
      }
      if ((asc && val < nextVal) || (!asc && val > nextVal)) {
        return -1;
      }

      // value must be equal to nextValue
      return 0;
    });

    // Adding sorted elements to the table body
    self._updateTable();

    // Updating dataset asc value
    th.dataset.asc = asc;
  }

  // Getters

  _currenRow() {
    return this.options.rowsPerPage * (this.currentPage - 1);
  }

  _lastRow() {
    return this._currenRow() + this.options.rowsPerPage;
  }

  _lastPage() {
    return Math.ceil(this.tableRows.length / this.options.rowsPerPage);
  }

  // Updates of elements

  _updateTable() {
    const self = this;
    const tbody = self.table.querySelector("tbody");

    if (self.options.paginable) {
      tbody.innerHTML = "";
      for (
        let i = self._currenRow();
        i < self._lastRow() && i < self.tableRows.length;
        i++
      ) {
        tbody.appendChild(self.tableRows[i]);
      }

      // Update buttons state
      if(this.options.paginable === "numbered-list") {
        self._setNumberedListPagination();
        self._updateButtonsNumbered();
      } else if (this.options.paginable === "buttons-only") {
        self._setButtonsOnlyPagination();
        self._forwardBackwardbuttons();
      }
    } else {
      for (const row of self.tableRows) {
        tbody.appendChild(row);
      }
    }
  }

  _forwardBackwardbuttons() {
    const self = this;
    if (self.currentPage === self._lastPage()) {
      self.tableContainer.querySelector("#forward-page").disabled = true;
      self.tableContainer.querySelector("#forward-all-pages").disabled = true;
    } else {
      self.tableContainer.querySelector("#forward-page").disabled = false;
      self.tableContainer.querySelector("#forward-all-pages").disabled = false;
    }

    if (self.currentPage === 1) {
      self.tableContainer.querySelector("#back-page").disabled = true;
      self.tableContainer.querySelector("#back-all-pages").disabled = true;
    } else {
      self.tableContainer.querySelector("#back-page").disabled = false;
      self.tableContainer.querySelector("#back-all-pages").disabled = false;
    }
  }

  _updateButtonsNumbered() {
    const self = this;

    this._forwardBackwardbuttons();

    const lastPageButtonDisabled = this.tableContainer.querySelector(
      ".ta-btn-pag-numbered:disabled"
    );

    if (lastPageButtonDisabled) {
      lastPageButtonDisabled.disabled = false;
    }

    self.tableContainer.querySelector(
      `#page-${self.currentPage}`
    ).disabled = true;
  }
}
