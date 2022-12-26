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
      // Reset all other table column sort icons
      state.headItems.filter(item => item !== state.headItems[payload.index]).forEach(item => item.asc = undefined);
      // Set current table column sorted
      state.headItems[payload.index].asc =
        state.headItems[payload.index].asc ? !state.headItems[payload.index].asc : true;

      const asc = state.headItems[payload.index].asc;
      const format = state.headItems[payload.index].format;

      state.bodyItems.sort(function (val, nextVal) {
        val = val[payload.index].label;
        nextVal = nextVal[payload.index].label;

        if (format) {
          val = sortDataFormat(format, val);
          nextVal = sortDataFormat(format, nextVal);
        } else {
          val = genericSortDataFormat(val);
          nextVal = genericSortDataFormat(nextVal);
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
      break;
    case "SEARCH":
      break;
    case "RESET":
    default:
      // state.counter = 0;
      break;
  }

  return state;
}
