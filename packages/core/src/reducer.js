import { sortDataFormat, genericSortDataFormat } from "./sort-utils";

/**
 * reducer functions to be executed updating the actual state
 *
 * @param {Object} previus state to be updated
 * @param {Object} action name to be executed and payload with some data
 */
export default function reducer(state, action) {
  const payload = action.payload;
  switch (action.type) {
    case "SORT_COLUMN":
      const headItems = state.headItems[0].items;
      const currentHeadItem = headItems[payload.index];

      // Reset all other table column sort icons
      headItems.filter(item => item !== currentHeadItem).forEach(item => item.asc = undefined);
      // Set current table column sorted
      currentHeadItem.asc =
        currentHeadItem.asc ? !currentHeadItem.asc : true;

      const asc = currentHeadItem.asc;
      const format = currentHeadItem.format;

      state.bodyItems.sort(function (val, nextVal) {
        let valLabel = JSON.stringify(val.items[payload.index].label);
        let nextValLabel = JSON.stringify(nextVal.items[payload.index].label);

        if (format) {
          valLabel = sortDataFormat(format, valLabel);
          nextValLabel = sortDataFormat(format, nextValLabel);
        } else {
          valLabel = genericSortDataFormat(valLabel);
          nextValLabel = genericSortDataFormat(nextValLabel);
        }

        if ((asc && valLabel > nextValLabel) || (!asc && valLabel < nextValLabel)) {
          return 1;
        }
        if ((asc && valLabel < nextValLabel) || (!asc && valLabel > nextValLabel)) {
          return -1;
        }

        // value must be equal to nextValue
        return 0;
      });

      break;
    case "POPULATE":
      state = { ...state, ...payload.data };
      break;
    case "RESET":
    default:
      break;
  }

  return state;
}
