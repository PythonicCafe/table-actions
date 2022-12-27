export default {
  headItems: [
    {
      items: [
        { label: "Column 1" },
        { label: "Column 2" },
        { label: "Column 3" },
      ]
    }
  ],
  bodyItems: [
    {
      items: [
        { label: "item4" },
        { label: "item5" },
        { label: "item6" }
      ]
    },
    {
      items: [
        { label: "item1" },
        { label: "item2" },
        { label: "item3" }
      ]
    }
  ],
  dataJson: {},
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
