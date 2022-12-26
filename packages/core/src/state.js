export default {
  headItems: [
    { label: "Column 1" },
    { label: "Column 2" },
    { label: "Column 3" },
  ],
  bodyItems: [
    [
      { label: "item4" },
      { label: "item5" },
      { label: "item6" }
    ],
    [
      
      { label: "item1" },
      { label: "item2" },
      { label: "item3" }
    ]
  ],
  element: {
    type: "table",
    responsive: true,
    checkboxes: false,
    checkboxesRef: "data-element-id",
    itemsPerPage: 10,
    interaction: {
      buttonLabel: "Interact",
      callback: function (checkedElements) {
        console.log(checkedElements);
      },
    },
    paginate: "buttons",
    search: true,
    sort: true,
  },
};


const newDefaultState = { 
  dataJson: {},
  headItems: {},
  bodyItems: {},
  element: {
    type: "table",
    responsive: true,
    checkboxes: false,
    checkboxesRef: "data-element-id",
    itemsPerPage: 10,
    interaction: {
      buttonLabel: "Interact",
      callback: function (checkedElements) {
        console.log(checkedElements);
      },
    },
    paginate: "buttons",
    search: true,
    sort: true,
  },
}
