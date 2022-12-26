/*
 * Sort-Utils functions
 */

/*
 * Normalize a stirng and return it
 *
 * @param {string} a string to be normalized (e.g. "imaginação", "tensão")
 * @returns {string} The normalized string
 */
export function toNormalForm(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Transforms the given date string from DD/MM/YYYY format to YYYY-MM-DD format.
 *
 * @param {string} val - The date string in DD/MM/YYYY format.
 * @returns {string} The date string in YYYY-MM-DD format.
 */
export function dateStringTransform(val) {
  const res = val.split("/");
  return res[2] + "-" + res[1] + "-" + res[0];
}

/**
 * Formats data for sorting purposes.
 *
 * @param {String} value The value to be formatted.
 * @return {String|Number} The formatted value.
 */
export function genericSortDataFormat(value) {
  const regex = /[\.\,\;\s\n]/g;
  let val = value.replace(regex, "").toLowerCase();

  return isNaN(val) ? toNormalForm(val) : parseFloat(val);
}

/**
 * Formats the given value according to the specified format.
 *
 * @param {string} format - The format to use.
 * @param {string} value - The value to format.
 * @returns {Date|number|string} The formatted value.
 */
export function sortDataFormat(format, value) {
  let val = value.trim();
  let result = "",
    valDate,
    valHour;

  switch (format) {
    case "DD/MM/YYYY":
      result = new Date(dateStringTransform(val));
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
        dateStringTransform(valDate) + "T" + valHour + ":00"
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
      result = genericSortDataFormat(val);
      break;
  }

  return result;
}

