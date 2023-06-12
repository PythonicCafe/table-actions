import { toNormalForm, newElementToNode, newElement } from "./utils.js";

export class TableActions {
  constructor(element, options = {}) {
    this.table =
      typeof element === "string" ? document.querySelector(element) : element;

    this.taResponsiveContainer = [...this.table.parentNode.classList].includes(
      "ta-responsive-full-width"
    );

    this.tableContainer = this.taResponsiveContainer
      ? this.table.parentNode.parentNode
      : this.table.parentNode;

    this.dataJson = options.data;

    this.options = {
      searchable: options.searchable !== undefined ? options.searchable : true,
      sortable: options.sortable !== undefined ? options.sortable : true,
      // TODO: make paginable set table as null showing all elements whithout pagination.
      // Now this is working by setting rowsPerPage total number of rows
      // paginable: list or buttons
      paginable: options.paginable || "buttons",
      rowsPerPage: options.rowsPerPage || 10,
      checkableRows: options.checkableRows !== undefined ? options.checkableRows : false,
      checkAllCheckbox: options.checkAllCheckbox !== undefined ? options.checkAllCheckbox : true,
      checkableRowTrReference: options.checkableRowTrReference || "data-row-id",
      alreadyAddedElements: options.alreadyAddedElements,
      checkedElementsCallback:
        options.checkedElementsCallback ||
        function (checkedElements) {
          console.log(checkedElements);
        },
      checkableButtonLabel: options.checkableButtonLabel || "Interact",
    };

    this._init();
  }

  _init() {
    // JSON data setted, TA will draw and populate HTML table
    if (this.dataJson) {
      this._populateTableFromJson(this.dataJson);
    }
    this._addTableClasses();

    // At least one column with search true will set search column header
    if (this.table.querySelector(`th[data-search='true']`)) {
      this._searchColumnsFields();
    }

    // Initial state table rows
    this.tableRows = [
      ...this.table.querySelector("tbody").querySelectorAll("tr"),
    ];

    this.hasPages = this._lastPage() > 1;
    this.currentPage = 1;

    const checkableRows = this.options.checkableRows;

    // Set bottom-div to add buttons
    newElementToNode("div", {
      classList: ["ta-bottom-div"],
      label: "",
      nodeToAppend: this.tableContainer,
    });

    if (checkableRows) this._tableCheckBoxes();
    if (this.options.sortable) this._tableSort(checkableRows);

    if (this.options.paginable && this.hasPages) {
      this._paginationButtons();
    }

    // Add dataset values to generate mobile table headers
    this._mobileTableLabels();

    // Add search field if searchable setted true
    if (this.options.searchable) {
      this._searchField();
    }

    this.defaultStateTableRows = [...this.tableRows];

    this._updateTable();
  }

  _populateTableFromJson(data) {
    this.JsonData = data;

    const thead = newElement("thead");
    const tbody = newElement("tbody");

    let tr = newElement("tr");

    this.table.appendChild(thead);
    this.table.appendChild(tbody);

    // Populating table head
    for (const head of data.headings) {
      newElementToNode("th", {
        label: head.label,
        nodeToAppend: tr,
        datasets: [
          { name: "type", value: head.type },
          { name: "search", value: head.search ? head.search : false }
        ],
      });
    }

    let rowIdField = data.headings.findIndex(
      (obj) => obj.name === data.rowIdField
    );
    if (this.options.checkableRows && rowIdField > 0) {
      rowIdField -= 1;
    } else {
      rowIdField = 0;
    }

    thead.appendChild(tr);

    if (data.data.length == 0) {
      this._emptyTableRowResult();
      return;
    }

    // Populating table rows
    for (const row of [...data.data]) {
      tr = newElement("tr");
      for (const el of row) {
        newElementToNode("td", {
          label: el,
          nodeToAppend: tr,
        });
      }
      tr.dataset.rowId = row[rowIdField];
      tbody.appendChild(tr);
    }
  }

  // Generating search fields in columns
  _searchColumnsFields() {
    const self = this;
    let data = {};

    if(this.JsonData) {
      data = this.JsonData;
    } else {
      const tableRowHeads = this.table.querySelector("tr");
      const tableHeads = tableRowHeads.querySelectorAll("th");
      data.headings = [];
      for (
        let thIndex = this.checkableRows ? 1 : 0; // if checkable column jump first
        thIndex < tableHeads.length;
        thIndex++
      ) {
        const th = tableHeads[thIndex];
        data.headings.push({
          format: th.dataset.format,
          label: th.innerText,
          search: th.dataset.search,
          title: th.title,
          type: th.dataset.type,
        })
      }
    }

    // Create one more header row in the table
    let trInteract = newElement("tr", ["ta__tr-interact"]);

    // If chechable row create an empty cell to format table
    if (this.options.checkableRows) {
      newElementToNode("th", {
        classList: ["ta-checkbox-column"],
        nodeToAppend: trInteract,
      });
    }

    for (const head of data.headings) {
      let th = newElementToNode("th", {
        nodeToAppend: trInteract,
      });

      if (head.search) {
        let div = newElement("div");
        div.classList = ["ta-search"];
        div.dataset.label = head.label;

        const input = newElement("input");
        input.classList = ["ta-search__input ta-search__input--column"];
        input.placeholder = "Pesquisa em " + head.label;

        const searchInput = head.searchInput ? head.searchInput : undefined;
        div.appendChild(input)
        // Activate search field by column
        input.addEventListener("keyup", function (e) {
          self.tableSearch(this.value.length === 0, ["Backspace", "Delete"].includes(e.key));
        });
        th.appendChild(div);
      }
    }

    this.table.querySelector("thead").appendChild(trInteract);
  }

  _addTableClasses() {
    const trs = this.table.querySelectorAll("thead>tr");
    trs[0].classList = ["ta__tr-main"];
  }

  // Generating elements functions
  _searchField() {
    const self = this;

    newElementToNode("input", {
      classList: ["ta-search__input"],
      label: "Pesquisa",
      nodeToAppend: this.tableContainer,
      prependEl: this.taResponsiveContainer
        ? this.table.parentNode
        : this.table,
      outsideElement: {
        element: "div",
        classList: ["ta-search"],
      },
    }).addEventListener("keyup", function (e) {
      self.tableSearch(this.querySelector("input").value.length === 0, ["Backspace", "Delete"].includes(e.key));
    });
  }

  tableSearch(currentFieldEmpty, erasing) {
    const self = this;
    const allSearchFieldEmpty = ![...self.tableContainer.querySelectorAll("input.ta-search__input")]
      .find(x => x.value.length > 0);
    let thCheckbox = self.table.querySelector("th>[type='checkbox']");

    if (thCheckbox) {
      thCheckbox.disabled = false;
    }

    // This will set default state to table, else set last state
    if (allSearchFieldEmpty || currentFieldEmpty || erasing) {
      self.tableRows = self.defaultStateTableRows;
    }

    const filters = [];
    let result = [];
    for (const searchField of self.tableContainer.querySelectorAll("input.ta-search__input")) {
      const search = searchField.value;
      const column = searchField.parentNode.dataset.label;

      if (search.length) {
        if (self.options.paginable) {
          // Return to page 1
          self.currentPage = 1;
        }
        filters.push({ search: searchField.value, column });
      }
    }

    for (const row of self.tableRows) {
      const tds = row.querySelectorAll("td");
      const tdValues = [];
      let filtered = true;

      // Extract td innerText and columns
      for (const td of tds) {
        let value = td.innerHTML;

        // If innerHTML is an Anchor HTML query inside text
        const anchor = td.querySelector("a");
        if (anchor) {
          value = anchor.innerHTML;
        }

        tdValues.push({ value, column: td.dataset.label });
      }

      // Check if all filters found result
      filtered = filters.every(
        // True if all filters found at least one result in tdValues
        filter => tdValues.some(tdValue => {
          // Filter has column value and it's different of tdValue column
          if (filter.column && tdValue.column !== filter.column) {
            return;
          }

          return tdValue.value
            .trim()
            .toLowerCase()
            .startsWith(filter.search.toLowerCase());
        })
      );

      if (filtered) {
        result.push(row);
      }
    }

    if (!result.length) {
      // All fields empty will set default state to table
      if (allSearchFieldEmpty) {
        result = self.defaultStateTableRows;
      } else {
        const tr = newElement("tr");
        const td = newElement("td", ["ta-td-message"]);
        td.dataset.label = "Message";
        td.colSpan = self.table.querySelectorAll("th").length;
        td.innerHTML = "Nenhum elemento a ser exibido";
        tr.appendChild(td);
        result.push(tr);

        // Disable check all fields
        if (thCheckbox) {
          thCheckbox.disabled = true;
        }
      }
    }

    self.tableRows = result;
    self._updateTable();
    self._butonCheckableRowsUpdate();
  }

  _paginationButtons() {
    const self = this;

    const bottomDiv = self.tableContainer.querySelector(".ta-bottom-div");

    newElementToNode("button", {
      classList: ["ta-btn", "ta-btn-pag-jump", "back-all-pages"],
      label: "&lt;&lt;",
      nodeToAppend: bottomDiv,
    }).addEventListener("click", function () {
      if (self.currentPage > 1) {
        self.currentPage = 1;
        self._updateTable();
      }
    });

    newElementToNode("button", {
      classList: ["ta-btn", "ta-btn-pag", "backward-page"],
      label: "&lt;",
      nodeToAppend: bottomDiv,
    }).addEventListener("click", function () {
      if (self.currentPage > 1) {
        self.currentPage = self.currentPage -= 1;
        self._updateTable();
      }
    });

    if (this.options.paginable === "list") {
      newElementToNode("div", {
        classList: ["ta-numbered-buttons"],
        nodeToAppend: bottomDiv,
      });
    } else if (this.options.paginable === "buttons") {
      newElementToNode("div", {
        classList: ["ta-paginable-pages"],
        nodeToAppend: bottomDiv,
      });
    }
    newElementToNode("button", {
      classList: ["ta-btn", "ta-btn-pag", "forward-page"],
      label: "&gt;",
      nodeToAppend: bottomDiv,
    }).addEventListener("click", function () {
      if (self.currentPage < self._lastPage()) {
        self.currentPage = self.currentPage += 1;
        self._updateTable();
      }
    });

    newElementToNode("button", {
      classList: ["ta-btn", "ta-btn-pag-jump", "forward-all-pages"],
      label: "&gt;&gt;",
      nodeToAppend: bottomDiv,
    }).addEventListener("click", function () {
      if (self.currentPage < self._lastPage()) {
        self.currentPage = self._lastPage();
        self._updateTable();
      }
    });
  }

  _mobileTableLabels() {
    const self = this;
    const tableHeadRow = this.table.querySelector("tr");
    const tableHeads = tableHeadRow.querySelectorAll("th");

    // If empty table rows do nothing
    if (self.tableRows.length == 0) {
      return;
    }

    for (const tr of self.tableRows) {
      for (const [key, th] of tableHeads.entries()) {
        const trCurrent = tr.querySelectorAll("td")[key];
        if (key === 0 && self.options.checkableRows) {
          trCurrent.dataset.label = "Checkbox";
          continue;
        }
        trCurrent.dataset.label = th.innerHTML;
      }
    }
  }

  _buttonsOnlyPagination() {
    const self = this;
    const div = self.tableContainer.querySelector(".ta-paginable-pages");
    div.innerHTML = `${this.currentPage} - ${this._lastPage()}`;
  }

  _numberedListPagination() {
    const self = this;
    const lastPage = this._lastPage();
    const currentPage = this.currentPage;

    const div = self.tableContainer.querySelector(".ta-numbered-buttons");
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

      newElementToNode("button", {
        classList: ["ta-btn", "ta-btn-pag-numbered", `page-${pageNumber}`],
        label,
        nodeToAppend: self.tableContainer.querySelector(".ta-numbered-buttons"),
      }).addEventListener("click", function () {
        self.currentPage = pageNumber;
        self._updateTable();
      });
    }
  }


  /**
   * Creates a checkbox input and a parent element of the specified type.
   *
   * @param {String} elementType The type of the parent element to be created.
   * @param {Array} [classes] An array of classes to be added to the parent element.
   * @param {Boolean} [disabled=false] A boolean indicating whether the checkbox should be disabled.
   *
   * @return {Object} The parent element containing the checkbox input.
   */
  _tableCheckboxInsert(elementType, classes = [], disabled = false) {
    const element = document.createElement(elementType);
    const input = document.createElement("input");

    if (classes.length) {
      element.classList.add(...classes);
    }

    if (disabled) {
      input.checked = true;
      input.disabled = disabled;
      input.title = "Objeto já está adicionado";
    }

    input.type = "checkbox";
    element.appendChild(input);

    return element;
  }

  _tableCheckBoxes() {
    // Get class reference to actual table
    const self = this;
    const alreadyAdded = this.options.alreadyAddedElements;

    const tableTrs = self.table.querySelectorAll("tbody>tr");
    // Add table header checkbox
    const tr = self.table.querySelector("thead>tr");
    if (this.options.checkAllCheckbox) {
      tr.prepend(this._tableCheckboxInsert("th", ["ta-checkbox-column"]));
    } else {
      const th = document.createElement("th")
      th.classList.add("ta-checkbox-column");
      tr.prepend(th);
    }


    // Add table rows checkbox
    for (const tr of tableTrs) {
      let newTdCheckbox;
      if (alreadyAdded && alreadyAdded.includes(tr.dataset.rowId)) {
        newTdCheckbox = self._tableCheckboxInsert("td", ["ta-checkbox-row"], true);
      } else {
        newTdCheckbox = self._tableCheckboxInsert("td", ["ta-checkbox-row"]);
      }

      tr.prepend(newTdCheckbox);
    }

    // Set interaction button
    const button = newElementToNode("button", {
      classList: ["ta-btn", "interact"],
      label: self.options.checkableButtonLabel,
      nodeToAppend: self.tableContainer.querySelector(".ta-bottom-div"),
      disabled: true,
    });

    // Click button show all element selected
    button.addEventListener("click", async function () {
      const checked = [];
      for (const tr of self.tableRows) {
        const checkbox = tr.querySelector("[type='checkbox']");
        if (checkbox.checked && !checkbox.disabled) {
          checked.push(tr.getAttribute(self.options.checkableRowTrReference));
        }
      }

      if (
        self.options.checkedElementsCallback !== undefined &&
        typeof self.options.checkedElementsCallback === "function"
      ) {
        const AddedObjects = await self.options.checkedElementsCallback(
          checked
        );
        for (const tr of tableTrs) {
          if (
            AddedObjects &&
            AddedObjects.includes(
              tr.getAttribute(self.options.checkableRowTrReference)
            )
          ) {
            tr.querySelector("input").disabled = true;
          }
        }
      }
    });

    // Table checkboxes logic, check all and check one by one
    var checkboxes = document.querySelectorAll("[type='checkbox']");

    for (const checkbox of checkboxes) {
      checkbox.addEventListener("click", function (event) {
        const thead = event.target.closest("thead");

        if (thead) {
          if (event.target.checked) {
            for (const el of self.tableRows) {
              const checkbox = el.querySelector("[type='checkbox']");
              checkbox.checked = true;
              checkbox.closest("tr").classList.add("checked");
            }
            button.disabled = false;
          } else {
            for (const el of self.tableRows) {
              const checkbox = el.querySelector("[type='checkbox']");
              checkbox.checked = false;
              checkbox.closest("tr").classList.remove("checked");
            }
            button.disabled = true;
          }
        } else {
          if (this.options.checkAllCheckbox) {
            self.table.querySelector("thead [type='checkbox']").checked = false;
          }
          event.target.closest("tr").classList.toggle("checked");
          self._butonCheckableRowsUpdate();
        }
      });
    }
  }

  _butonCheckableRowsUpdate() {
    if (!this.options.checkableRows) {
      return;
    }

    this.tableContainer.querySelector(".interact").disabled =
      !this.tableRows.find((el) =>
        el.querySelector("[type='checkbox']:checked")
      );
  }

  /**
   * Adds sorting functionality to a table.
   *
   * @param {Boolean} checkableRows Indicates whether the first column of the table is checkable.
   */
  _tableSort(checkableRows) {
    // TODO: Add a third state where none of headers is ordered (return to initial state)
    // TODO: After search reorder table to last sorted order
    const self = this;

    // Setting class to activate table arrows styles
    this.table.classList.add("ta-sortable");

    const tableRowHeads = this.table.querySelector("tr");
    const tableHeads = tableRowHeads.querySelectorAll("th");
    for (
      let thIndex = checkableRows ? 1 : 0; // if checkable column jump first
      thIndex < tableHeads.length;
      thIndex++
    ) {
      const th = tableHeads[thIndex];
      if (th.dataset.unsortable != undefined) {
        continue;
      }

      // TODO: add tabIdex make table heder accessible with keyboard
      // and and make possible to sort using space or enter key with th.tabIndex = 0;

      // Following lines will happen in sorted table
      const otherTh = [];

      // Getting other columns to remove active icons classes
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

  /**
   * Transforms the given date string from DD/MM/YYYY format to YYYY-MM-DD format.
   *
   * @param {string} val - The date string in DD/MM/YYYY format.
   * @returns {string} The date string in YYYY-MM-DD format.
   */
  _dateStringTransform(val) {
    const res = val.split("/");
    return res[2] + "-" + res[1] + "-" + res[0];
  }

  /**
   * Formats the given value according to the specified format.
   *
   * @param {string} format - The format to use.
   * @param {string} value - The value to format.
   * @returns {Date|number|string} The formatted value.
   */
  _sortDataFormat(format, value) {
    const self = this;
    let val = value.trim();
    let result = "",
      valDate,
      valHour;

    switch (format) {
      case "DD/MM/YYYY":
        result = new Date(self._dateStringTransform(val));
        break;
      case "YYYY/MM/DD":
        result = new Date(val.replace("/", "-"));
        break;
      case "YYYY-MM-DD":
        result = new Date(val);
        break;
      case "DD/MM/YYYY HH:MM":
        [valDate, valHour] = val.split(" ");
        result = new Date(
          self._dateStringTransform(valDate) + "T" + valHour + ":00"
        );
        break;
      case "YYYY-MM-DD HH:MM:SS":
        [valDate, valHour] = val.split(" ");
        result = new Date(valDate + "T" + valHour);
        break;
      case "currency-real":
      case "numeric(15, 2)":
        result = +val.replace(/[\.\,R\$\s]/g, "");
        break;
      default:
        result = self._genericSortDataFormat(val);
        break;
    }

    return result;
  }

  /**
   * Formats data for sorting purposes.
   *
   * @param {String} value The value to be formatted.
   * @return {String|Number} The formatted value.
   */
  _genericSortDataFormat(value) {
    const regex = /[\.\,\;\s\n]/g;
    let val = value.replace(regex, "").toLowerCase();

    return isNaN(val) ? toNormalForm(val) : parseFloat(val);
  }

  /**
   * Sorts the rows of the table based on the data in the given column.
   *
   * @param {HTMLElement} th - The `th` element representing the column to be sorted.
   * @param {number} thIndex - The index of the column to be sorted.
   * @param {HTMLElement[]} otherThs - An array of `th` elements representing the other columns in the table.
   */
  _sortTable(th, thIndex, otherThs) {
    const self = this;
    const asc = th.dataset.asc ? !JSON.parse(th.dataset.asc) : true;
    const format = th.dataset.format || th.dataset.type;

    for (const otherTh of otherThs) {
      otherTh.removeAttribute("data-asc");
    }

    self.tableRows.sort(function (val, nextVal) {
      val = val.querySelectorAll("td")[thIndex].innerHTML;
      nextVal = nextVal.querySelectorAll("td")[thIndex].innerHTML;

      if (format) {
        val = self._sortDataFormat(format, val);
        nextVal = self._sortDataFormat(format, nextVal);
      } else {
        val = self._genericSortDataFormat(val);
        nextVal = self._genericSortDataFormat(nextVal);
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

  // Rows positions

  _currenRow() {
    return this.options.rowsPerPage * (this.currentPage - 1);
  }

  _lastRow() {
    return this._currenRow() + this.options.rowsPerPage;
  }

  _lastPage() {
    return Math.ceil(this.tableRows.length / this.options.rowsPerPage);
  }

  _emptyTableRowResult() {
    const self = this;

    // If message already do nothing
    if (this.table.querySelector(".ta-td-message")) {
      return;
    }

    const tbody = this.table.querySelector("tbody");
    const tr = newElement("tr");
    const td = newElement("td", ["ta-td-message"]);
    td.innerHTML = "Nenhum elemento a ser exibido";
    td.colSpan = this.table.querySelectorAll("th").length;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  // Updates of elements

  _updateTable() {
    const self = this;

    if (self.tableRows.length == 0) {
      self._emptyTableRowResult();
      return;
    }

    const tbody = self.table.querySelector("tbody");

    tbody.innerHTML = "";
    if (self.options.paginable) {
      for (
        let i = self._currenRow();
        i < self._lastRow() && i < self.tableRows.length;
        i++
      ) {
        tbody.appendChild(self.tableRows[i]);
      }

      // Update buttons state
      if (this.options.paginable === "list" && this.hasPages) {
        self._numberedListPagination();
        self._updateButtonsNumbered();
      } else if (this.options.paginable === "buttons" && this.hasPages) {
        self._buttonsOnlyPagination();
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
    const tc = self.tableContainer;

    if (self.currentPage === self._lastPage()) {
      tc.querySelector(".forward-page").disabled = true;
      tc.querySelector(".forward-all-pages").disabled = true;
    } else {
      tc.querySelector(".forward-page").disabled = false;
      tc.querySelector(".forward-all-pages").disabled = false;
    }

    if (self.currentPage === 1) {
      tc.querySelector(".backward-page").disabled = true;
      tc.querySelector(".back-all-pages").disabled = true;
    } else {
      tc.querySelector(".backward-page").disabled = false;
      tc.querySelector(".back-all-pages").disabled = false;
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
      `.page-${self.currentPage}`
    ).disabled = true;
  }
}
