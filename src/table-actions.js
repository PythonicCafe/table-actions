import { toNormalForm, newElement } from "./utils.js";

export class TableActions {
  constructor(element, options = {}) {
    this.table =
      typeof element === "string" ? document.querySelector(element) : element;

    this.tableContainer = [...this.table.parentNode.classList].includes("ta-responsive") ?
      this.table.parentNode.parentNode : this.table.parentNode;

    this.tableRows = [
      ...this.table.querySelector("tbody").querySelectorAll("tr"),
    ];

    this.currentPage = 1;

    this.options = {
      sortable: options.sortable ?? true,
      // paginable: list or buttons
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
    newElement("div", ["ta-bottom-div"], "", this.tableContainer);

    if (checkableRows) this._setTableCheckBoxes();
    if (this.options.sortable) this._setTableSort(checkableRows);

    if (this.options.paginable && this._lastPage() > 1) {
      this._setPaginationButtons();
      this._updateTable();
    }

    this._setMobileTableLabels();
  }

  // Setters

  _setPaginationButtons() {
    const self = this;

    const bottomDiv = self.tableContainer.querySelector(".ta-bottom-div");

    newElement(
      "button",
      ["ta-btn", "ta-btn-pag-jump", "back-all-pages"],
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
      ["ta-btn", "ta-btn-pag", "back-page"],
      "&lt;",
      bottomDiv
    ).addEventListener("click", function () {
      if (self.currentPage > 1) {
        self.currentPage = self.currentPage -= 1;
        self._updateTable();
      }
    });

    if (this.options.paginable === "list") {
      newElement("div", ["ta-numbered-buttons"], "", bottomDiv);
    } else if (this.options.paginable === "buttons") {
      newElement("div", ["ta-paginable-pages"], "", bottomDiv);
    }
    newElement(
      "button",
      ["ta-btn", "ta-btn-pag", "forward-page"],
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
      ["ta-btn", "ta-btn-pag-jump", "forward-all-pages"],
      "&gt;&gt;",
      bottomDiv
    ).addEventListener("click", function () {
      if (self.currentPage < self._lastPage()) {
        self.currentPage = self._lastPage();
        self._updateTable();
      }
    });
  }

  _setMobileTableLabels() {
    const self = this;
    const tableHeads = this.table.querySelectorAll("th");
 
    for (const tr of self.tableRows) {
      for (const [key, th] of tableHeads.entries()) {
        const trCurrent = tr.querySelectorAll("td")[key];
        if (key === 0) {
          trCurrent.dataset.label = "Checkbox";
          continue;
        }
        trCurrent.dataset.label = th.innerHTML;
      }
    }
  }

  _setButtonsOnlyPagination() {
    const self = this;
    const div = self.tableContainer.querySelector(".ta-paginable-pages");
    div.innerHTML = `${this.currentPage} - ${this._lastPage()}`;
  }

  _setNumberedListPagination() {
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

      newElement(
        "button",
        ["ta-btn", "ta-btn-pag-numbered", `page-${pageNumber}`],
        label,
        self.tableContainer.querySelector(".ta-numbered-buttons")
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
      ["ta-btn", "interact"],
      "Interact",
      self.tableContainer.querySelector(".ta-bottom-div"),
      true
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
              button.disabled = false;
            } else {
              checkbox.checked = false;
              checkbox.closest("tr").classList.remove("checked");
              button.disabled = true;
            }
          }
        } else {
          self.table.querySelector("thead [type='checkbox']").checked = false;
          event.target.closest("tr").classList.toggle("checked");
          button.disabled = 
            self.table.querySelector("[type='checkbox']:checked") ? false : true; 
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
      if (th.dataset.unsortable != undefined){
        continue
      };

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

  _dateStringTransform(val) {
    const res = val.split("/");
    return res[2] + "-" + res[1] + "-" + res[0];
  }

  _sortDataFormat(format, value, nextValue) {
    const self = this;
    let val = value.trim();
    let nextVal = nextValue.trim();

    if(format === "DD/MM/YYYY") {
      val = new Date(self._dateStringTransform(val));
      nextVal = new Date(self._dateStringTransform(nextVal));
    } else if (format === "YYYY/MM/DD") {
      val = new Date(val.replace("/", "-"));
      nextVal = new Date(nextVal.replace("/", "-"));
    } else if (format === "YYYY-MM-DD") {
      val = new Date(val);
      nextVal = new Date(nextVal);
    } else if (format === "DD/MM/YYYY HH:MM") {
      const [valDate, valHour] = val.split(" ");
      val = new Date(self._dateStringTransform(valDate) + "T" + valHour + ":00");
      const [nextValDate, nextValHour] = nextVal.split(" ");
      nextVal = new Date(self._dateStringTransform(nextValDate) + "T" + nextValHour + ":00");
    } else if (format === "YYYY-MM-DD HH:MM:SS") {
      const [valDate, valHour] = val.split(" ");
      val = new Date(valDate + "T" + valHour);
      const [nextValDate, nextValHour] = nextVal.split(" ");
      nextVal = new Date(nextValDate + "T" + nextValHour);
    } else {
      // If format unrecognized do a generic sort
      return self._genericSortDataFormat(val, nextVal);
    }

    return [val, nextVal];
  }

  _genericSortDataFormat(value, nextValue) {
    const regex = /[\ \,\;\n]/g;

    let val = value.replace(regex, "").toLowerCase();
    let nextVal = nextValue.replace(regex, "").toLowerCase();

    if (!isNaN(val)) {
      val = parseFloat(val);
      nextVal = parseFloat(nextVal);
    } else {
      val = toNormalForm(val);
      nextVal = toNormalForm(nextVal);
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
        [val, nextVal] = self._genericSortDataFormat(val, nextVal);
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
      if (this.options.paginable === "list") {
        self._setNumberedListPagination();
        self._updateButtonsNumbered();
      } else if (this.options.paginable === "buttons") {
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
      self.tableContainer.querySelector(".forward-page").disabled = true;
      self.tableContainer.querySelector(".forward-all-pages").disabled = true;
    } else {
      self.tableContainer.querySelector(".forward-page").disabled = false;
      self.tableContainer.querySelector(".forward-all-pages").disabled = false;
    }

    if (self.currentPage === 1) {
      self.tableContainer.querySelector(".back-page").disabled = true;
      self.tableContainer.querySelector(".back-all-pages").disabled = true;
    } else {
      self.tableContainer.querySelector(".back-page").disabled = false;
      self.tableContainer.querySelector(".back-all-pages").disabled = false;
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
