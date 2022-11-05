import { toNormalForm, newElementToNode, newElement } from "./utils.js";

export class TableActions {
  constructor(element, options = {}) {
    this.table =
      typeof element === "string" ? document.querySelector(element) : element;

    this.taResponsiveContainer = [...this.table.parentNode.classList].includes(
      "ta-responsive"
    );

    this.tableContainer = this.taResponsiveContainer
      ? this.table.parentNode.parentNode
      : this.table.parentNode;

    this.dataJson = options.data;

    this.options = {
      searchable: options.searchable || true,
      sortable: options.sortable || true,
      // paginable: list or buttons
      paginable: options.paginable || "buttons",
      rowsPerPage: options.rowsPerPage || 10,
      checkableRows: options.checkableRows || false,
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
    if (this.dataJson) {
      this._populateTableFromJson(this.dataJson);
    }

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

    if (checkableRows) this._setTableCheckBoxes();
    if (this.options.sortable) this._setTableSort(checkableRows);

    if (this.options.paginable && this.hasPages) {
      this._setPaginationButtons();
      this._updateTable();
    }

    this._setMobileTableLabels();

    if (this.options.searchable) {
      this._setSearchField();
    }
  }

  _populateTableFromJson(data) {
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
        datasets: [{ name: "type", value: head.type }],
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

  // Setters
  _setSearchField() {
    const self = this;
    self.defaultStateTableRows = [...self.tableRows];

    newElementToNode("input", {
      label: "Pesquisa",
      nodeToAppend: this.tableContainer,
      prependEl: this.taResponsiveContainer
        ? this.table.parentNode
        : this.table,
      outsideElement: {
        element: "div",
        classList: ["ta-search-container"],
      },
    }).addEventListener("keyup", function () {
      const search = this.querySelector("input").value;
      const result = [];
      let thCheckbox = self.table.querySelector("th>[type='checkbox']");

      if (thCheckbox) {
        thCheckbox.disabled = false;
      }

      self.tableRows = self.defaultStateTableRows;

      if (search.length > 2) {
        if (self.options.paginable) {
          self.currentPage = 1;
        }
        for (const row of self.tableRows) {
          const tds = row.querySelectorAll("td");

          for (const td of tds) {
            let text = td.innerHTML;

            const anchor = td.querySelector("a");
            if (anchor) {
              text = anchor.innerHTML;
            }

            if (
              text
                .trim()
                .toLowerCase()
                .startsWith(this.querySelector("input").value.toLowerCase())
            ) {
              result.push(row);
              break;
            }
          }
        }

        if (!result.length) {
          const tr = newElement("tr");
          const td = newElement("td", ["ta-td-message"]);
          td.dataset.label = "Message";
          td.colSpan = self.table.querySelectorAll("th").length;
          td.innerHTML = "Nenhum elemento a ser exibido";
          tr.appendChild(td);
          result.push(tr);

          if (thCheckbox) {
            thCheckbox.disabled = true;
          }
        }

        self.tableRows = result;
      }

      self._updateTable();

      self._butonCheckableRowsUpdate();
    });
  }

  _setPaginationButtons() {
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

  _setMobileTableLabels() {
    const self = this;
    const tableHeads = this.table.querySelectorAll("th");

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

  _setTableCheckBoxes() {
    // Get class reference to actual table
    const self = this;
    const alreadyAdded = this.options.alreadyAddedElements;

    function tableCheckboxInsert(elementType, classes = [], disabled = false) {
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

    const tableTrs = self.table.querySelectorAll("tbody>tr");
    // Add table header checkbox
    const tr = self.table.querySelector("thead>tr");
    tr.prepend(tableCheckboxInsert("th", ["ta-checkbox-column"]));

    // Add table rows checkbox
    for (const tr of tableTrs) {
      let newTdCheckbox;
      if (alreadyAdded && alreadyAdded.includes(tr.dataset.rowId)) {
        newTdCheckbox = tableCheckboxInsert("td", ["ta-checkbox-row"], true);
      } else {
        newTdCheckbox = tableCheckboxInsert("td", ["ta-checkbox-row"]);
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
          self.table.querySelector("thead [type='checkbox']").checked = false;
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
      if (th.dataset.unsortable != undefined) {
        continue;
      }

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

  _genericSortDataFormat(value) {
    const regex = /[\.\,\;\s\n]/g;
    let val = value.replace(regex, "").toLowerCase();

    return isNaN(val) ? toNormalForm(val) : parseFloat(val);
  }

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
        self._setNumberedListPagination();
        self._updateButtonsNumbered();
      } else if (this.options.paginable === "buttons" && this.hasPages) {
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
      self.tableContainer.querySelector(".backward-page").disabled = true;
      self.tableContainer.querySelector(".back-all-pages").disabled = true;
    } else {
      self.tableContainer.querySelector(".backward-page").disabled = false;
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
